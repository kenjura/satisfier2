import DebugView from './components/DebugView';
import logo from './logo.svg';
import './App.scss';
import { Link, Route, useRoute } from "wouter";


function App() {
  const [isCalculator] = useRoute("/calculator");
  const [isRecipes] = useRoute("/recipes");

  return (
    <div className="App main-grid">
      
      <header className="app-header">
        Satisfier
          
      </header>

      <nav id="nav-main">
        <Link href="/calculator" className={isCalculator ? 'active' :''}>Calculator</Link>
        <Link href="/recipes" className={isRecipes ? 'active' : ''}>Recipes</Link>
      </nav>

      <DebugView />
      <section id="main">
        {/*

        <Route path="/about">About Us</Route>
        <Route path="/users/:name">
          {(params) => <div>Hello, {params.name}!</div>}
        </Route>
        <Route path="/inbox" component={InboxPage} />
      */}

        <Route path="/calculator">Calculator</Route>
        <Route path="/recipes">Recipes</Route>

      </section>
    </div>
  );
}

export default App;
