import DebugView from "./components/DebugView";
import CalculatorPage from "./components/CalculatorPage";
import RecipesPage from "./components/RecipesPage";
import Nav from "./components/Nav";
import logo from "./logo.svg";
import "./App.scss";
import { Link, Route, useRoute } from "wouter";
import * as React from "react";

function App() {
  return (
    <div className="App main-grid">
      <header className="app-header">Satisfier</header>

      <Nav />

      <DebugView />
      <section id="main">
        <Route path="/calculator">
          <CalculatorPage />
        </Route>
        <Route path="/recipes">
          <RecipesPage />
        </Route>
      </section>
    </div>
  );
}

export default App;
