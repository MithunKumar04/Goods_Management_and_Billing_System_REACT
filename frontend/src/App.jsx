import {BrowserRouter, Routes, Route} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import LoginC from './Pages/LoginC';
import HomeC from './Pages/HomeC';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginC/>}></Route>
        <Route path='/home/:name' element={<HomeC/>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
