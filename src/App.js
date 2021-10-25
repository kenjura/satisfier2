import CalculatorPage from "./components/CalculatorPage";
import RecipesPage from "./components/RecipesPage";
import Nav from "./components/Nav";
import "./App.scss";
import { Route } from "wouter";
import * as React from "react";

function App() {
  return (
    <div className="App main-grid">
      <header className="app-header">Satisfier</header>

      <Nav />

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
