import React from 'react';
import { Router, Route } from 'electron-router-dom';

import { MainScreen } from './screens';

export function AppRoutes() {
  return (
    <Router
      main={
        <>
          <Route path="/" element={<MainScreen />} />
          <Route path="/anotherScreen" element={<MainScreen />} />
        </>
      }
      about={<Route path="/" element={<MainScreen />} />}
    />
  );
}
