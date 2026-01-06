import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import MyTeamScreen from '../screens/MyTeamScreen';
import EventScreen from '../screens/EventScreen';
import LeaguesScreen from '../screens/LeaguesScreen';
import CreateLeagueScreen from '../screens/CreateLeagueScreen';
import RankingScreen from '../screens/RankingScreen';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginScreen />} />
      <Route path="/home" element={<HomeScreen />} />
      <Route path="/my-team" element={<MyTeamScreen />} />
      <Route path="/event/:eventId" element={<EventScreen />} />
      <Route path="/leagues" element={<LeaguesScreen />} />
      <Route path="/create-league" element={<CreateLeagueScreen />} />
      <Route path="/ranking" element={<RankingScreen />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
