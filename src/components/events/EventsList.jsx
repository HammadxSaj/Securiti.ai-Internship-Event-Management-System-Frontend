import React, { useState, useEffect } from 'react';
import { Grid, TextField } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DisplayCards from './DisplayCards';
import NavBar from '../Home/NavBar';
import { db, auth } from '../../Firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import './EventsList.css';
import AddEventButton from '../admin/AddEventButton';
import CountdownTimer from './CountdownTimer';
import { useNavigate } from 'react-router-dom';
import PastIdeas from './types/PastIdeas';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [votingEnded, setVotingEnded] = useState(false);
  const [votingEndDate, setVotingEndDate] = useState(null);
  const [winnerEvent, setWinnerEvent] = useState(null);
  const [winnerDetermined, setWinnerDetermined] = useState(false);
  const [winners, setWinners] = useState([]);
  const navigate = useNavigate();
  const [votingStartDate, setVotingStartDate] = useState(null);
  const [votingStarted, setVotingStarted] = useState(false);
  const [eventsWithWinners, setEventsWithWinners] = useState([]);
  const [winnerIdeas, setWinnerIdeas] = useState([]);
  


  const handleBack = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const eventPromises = eventsSnapshot.docs.map(async (docRef) => {
          const event = {
            id: docRef.id,
            title: docRef.data().title,
            date: docRef.data().dateTime,
            description: docRef.data().description,
            images: [],
            upvote: docRef.data().upvote || [],
            downvote: docRef.data().downvote || [],
          };

          const imagesCollection = collection(docRef.ref, 'images');
          const imagesSnapshot = await getDocs(imagesCollection);
          imagesSnapshot.forEach((imageDoc) => {
            const imageUrl = imageDoc.data().imageUrls;
            if (imageUrl) {
              event.images.push(imageUrl[0]);
            }
          });

          const winnerIdeaDoc = await getDoc(doc(docRef.ref, 'details', 'winnerIdea'));
          if (winnerIdeaDoc.exists()) {
            console.log('Winner here: ',winnerIdeaDoc.data().ideaId);
            event.winnerIdea = winnerIdeaDoc.data().ideaId;
          }
          

          return event;
        });

        const fetchedEvents = await Promise.all(eventPromises);
        setEvents(fetchedEvents);
        const winnersList = fetchedEvents.filter(event => event.winnerIdea).map(event => ({
          ideaId: event.winnerIdea,
          eventId: event.id,
        }));
        setWinners(winnersList);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    const fetchVotingEndDate = async () => {
      try {
        const votingEndDateDoc = await getDoc(doc(db, 'settings', 'votingEndDate'));
        if (votingEndDateDoc.exists()) {
          const fetchedDate = votingEndDateDoc.data().date.toDate();
          setVotingEndDate(fetchedDate);

          const now = new Date();
          setVotingEnded(now >= fetchedDate);

          if (now >= fetchedDate) {
            await fetchWinnerEvent();
          }
        }
      } catch (error) {
        console.error('Error fetching voting end date:', error);
      }
    };

    const fetchVotingStartDate = async () => {
      try {
        const votingStartDateDoc = await getDoc(doc(db, 'settings', 'votingStartDate'));
        if (votingStartDateDoc.exists()) {
          const fetchedDate = votingStartDateDoc.data().date.toDate();
          setVotingStartDate(fetchedDate);

          const now = new Date();
          setVotingStarted(now >= fetchedDate);
        }
      } catch (error) {
        console.error('Error fetching voting start date:', error);
      }
    };

    const fetchWinnerEvent = async () => {
      try {
        const winnerEventDoc = await getDoc(doc(db, 'settings', 'winnerEvent'));
        if (winnerEventDoc.exists()) {
          const winnerEventId = winnerEventDoc.data().eventId;
          const winnerEventDocRef = doc(db, 'events', winnerEventId);
          const winnerEventDocSnapshot = await getDoc(winnerEventDocRef);

          if (winnerEventDocSnapshot.exists()) {
            const winnerEvent = {
              id: winnerEventDocSnapshot.id,
              title: winnerEventDocSnapshot.data().title,
              date: winnerEventDocSnapshot.data().dateTime,
              description: winnerEventDocSnapshot.data().description,
              images: [],
              upvote: winnerEventDocSnapshot.data().upvote,
              downvote: winnerEventDocSnapshot.data().downvote,
            };

            const imagesCollection = collection(winnerEventDocRef, 'images');
            const imagesSnapshot = await getDocs(imagesCollection);
            imagesSnapshot.forEach((imageDoc) => {
              const imageUrl = imageDoc.data().imageUrls;
              if (imageUrl) {
                winnerEvent.images.push(imageUrl[0]);
              }
            });

            setWinnerEvent(winnerEvent);
            setWinnerDetermined(true);
            console.log('Winner event fetched from Firebase:', winnerEvent);
          } else {
            console.log('Winner event document does not exist.');
          }
        } else {
          console.log('Winner event ID does not exist in settings.');
        }
      } catch (error) {
        console.error('Error fetching winner event from Firebase:', error);
      }
    };

    fetchEvents();
    fetchVotingEndDate();
    fetchVotingStartDate();
  }, []);



  const fetchWinnerEventIdea = async () => {
    try {
      const eventsSnapshot = await getDocs(collection(db, 'events'));
  
      // Array to store events with winner ideas
      const eventsWithWinners = [];
  
      // Iterate through each event document
      for (const docRef of eventsSnapshot.docs) {
        // Initialize event object
        const event = {
          id: docRef.id,
          title: docRef.data().title,
          date: docRef.data().dateTime,
          description: docRef.data().description,
          images: [],
          upvote: docRef.data().upvote || [],
          downvote: docRef.data().downvote || [],
        };
  
        // Fetch images for the event
        const imagesCollection = collection(docRef.ref, 'images');
        const imagesSnapshot = await getDocs(imagesCollection);
        imagesSnapshot.forEach((imageDoc) => {
          const imageUrl = imageDoc.data().imageUrls;
          if (imageUrl) {
            event.images.push(imageUrl[0]); // Assuming you want to push only the first image URL
          }
        });
  
        // Fetch winner idea for the event
        const winnerIdeaDoc = await getDoc(doc(docRef.ref, 'details', 'winnerIdea'));
        if (winnerIdeaDoc.exists()) {
          event.winnerIdea = winnerIdeaDoc.data().ideaId;
          eventsWithWinners.push(event); // Push event with winner idea to array
        } else {
          console.log(`No winner idea found for event ${docRef.id}`);
        }
      }
  
      console.log('Events with winners:', eventsWithWinners);
      return eventsWithWinners;
    } catch (error) {
      console.error('Error fetching events with winners:', error);
      return []; // Return empty array or handle error as per your requirement
    }
  };
  
  
  const fetchIdeaById = async (eventId, ideaId) => {
    try {
      const ideaDoc = doc(db, 'events', eventId, 'ideas', ideaId);
      const ideaSnapshot = await getDoc(ideaDoc);

      if (ideaSnapshot.exists()) {
        const ideaData = ideaSnapshot.data();

        // Fetch images for the idea
        const imagesCollection = collection(ideaDoc, 'images');
        const imagesSnapshot = await getDocs(imagesCollection);
        const imageUrls = imagesSnapshot.docs.map(imageDoc => imageDoc.data().imageUrls[0]);

        const ideaWithImages = {
          id: ideaSnapshot.id,
          ...ideaData,
          images: imageUrls
        };

        return ideaWithImages;
      } else {
        console.error('Idea not found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching idea:', error);
      return null;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (votingEndDate) {
        const now = new Date();
        const distance = votingEndDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);

        if (distance < 0) {
          clearInterval(interval);
          setTimeRemaining(`0d 0h 0m 0s`);
          console.log("Time is over");
          setVotingEnded(true);
          determineWinner();
        } else if (!votingStarted && now >= votingStartDate) {
          setVotingStarted(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [votingEndDate, votingStartDate, winnerDetermined]);

  const handleDateUpdate = async (date) => {
    setVotingEndDate(date);
    setVotingEnded(false);

    try {
      await setDoc(doc(db, 'settings', 'votingEndDate'), { date });
    } catch (error) {
      console.error('Error updating voting end date:', error);
    }
  };

  const handleStartDateUpdate = async (date) => {
    setVotingStartDate(date);
    setVotingStarted(false);

    try {
      await setDoc(doc(db, 'settings', 'votingStartDate'), { date });
    } catch (error) {
      console.error('Error updating voting start date:', error);
    }
  };

  const determineWinner = async () => {
    try {
      let winningEvent = null;
      let maxVotes = -Infinity;

      for (const event of events) {
        const netVotes = (event.upvote || []).length - (event.downvote || []).length;

        if (netVotes > maxVotes) {
          maxVotes = netVotes;
          winningEvent = event;
        }
      }

      if (winningEvent) {
        await setDoc(doc(db, 'settings', 'winnerEvent'), { eventId: winningEvent.id });
        setWinnerEvent(winningEvent);
        setWinnerDetermined(true);
      }
    } catch (error) {
      console.error('Error determining winner:', error);
    }
  };

  const fetchUserRole = async () => {
    try {
      const user = auth.currentUser;

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };



  useEffect(() => {
    
    fetchUserRole();
  }, []);

  // useEffect(() => {

    
  //   if (winners.length > 0) {
  //    // fetchAllWinnerIdeas().then((fetchedWinnerIdeas) => {
  //      // setWinners(fetchedWinnerIdeas);
  //     });
  //   }
  // }, [winners]);

  useEffect(() => {
    const fetchData = async () => {
      const eventsWithWinnersData = await fetchWinnerEventIdea();
      setEventsWithWinners(eventsWithWinnersData);

      const ideasPromises = eventsWithWinnersData.map(event => 
        fetchIdeaById(event.id, event.winnerIdea)
      );

      const winnerIdeasData = await Promise.all(ideasPromises);
      setWinnerIdeas(winnerIdeasData);
    };

    fetchData();
  }, []);
  

  return (
    <>
      <NavBar />
      {userRole === 'admin' && (
        <div style={{ float: 'right' }}>
          <DatePicker
            selected={votingEndDate}
            onChange={handleDateUpdate}
            showTimeSelect
            dateFormat="Pp"
            customInput={<TextField label="Voting End Date" />}
          />
          <DatePicker
            selected={votingStartDate}
            onChange={handleStartDateUpdate}
            showTimeSelect
            dateFormat="Pp"
            customInput={<TextField label="Voting Start Date" />}
          />
          <AddEventButton />
        </div>
      )}
      <div className="events-list-container">
        <div className="header-section">
          <h1 className="header-title">Explore the best event ideas to choose from!</h1>
          
          {votingStarted && (
            <div>
              <h2>Countdown Timer</h2>
              <CountdownTimer timeRemaining={timeRemaining} votingEnded={votingEnded} votingStarted={votingStarted} />
            </div>
          )}
          {!votingStarted && votingStartDate && (
            <h2>{`Voting Starts on ${votingStartDate.getDate()} ${votingStartDate.toLocaleString('default', { month: 'long' })} ${votingStartDate.getFullYear()} at ${votingStartDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}!`}</h2>
          )}
        </div>
        
        {votingEnded && winnerEvent && (
          <div className="winner-event-section">
            <h2>The Winner Event!</h2>
            <DisplayCards event={winnerEvent} votingEnded={votingEnded} winningEventprop={true} votingStarted={votingStarted}/>
          </div>
        )}
        <h2>The Events</h2>
        <Grid container spacing={4} justifyContent="center">
          {events.map((event) => (
            <Grid item key={event.id}>
              <DisplayCards event={event} votingEnded={votingEnded} winningEventprop={false} votingStarted={votingStarted} />
            </Grid>
          ))}
        </Grid>
        {winners.length > 0 && (
          <div className="past-winners-section">
            <h2>Past Winners</h2>
            
            
            <div>
            {eventsWithWinners.map(event => (
              <div key={event.id}>
              
                <div>
                  
                  {winnerIdeas.map((idea, index) => (
                    <div key={index}>
                      {idea && idea.id === event.winnerIdea && (
                        <div>
                          <PastIdeas idea = {idea} eventId = {event.id}/>
                          {/* <p>{idea.title}</p>
                          <p>{idea.description}</p>
                          {idea.images.map((image, imgIndex) => (
                            <img key={imgIndex} src={image} alt={`Idea ${imgIndex}`} />
                          ))} */}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
            {/* <Grid container spacing={4} justifyContent="center"> */}
              {/* {winners.map((winner) => ( */}
                {/* <Grid item key={winner.id}> */}
                  {/* <PastIdeas idea={winner}/> */}
                {/* </Grid> */}
              {/* ))} */}
            {/* </Grid> */}
          </div>
        )}
      </div>
    </>
  );
};

export default EventsList;
