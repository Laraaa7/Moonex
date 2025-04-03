import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import {Login} from "../pages/LogisPage";
import {Feed} from "../pages/FeedPage";
import {ProtectorRuta} from "../components/ProtectorRuta";
export function MyRoutes() {
  const {user} = UserAuth();
  const RequireAuth =({children})=>{
    return user?children: <Navigate to={"/login"}/>;
  }
  return (<BrowserRouter>
  <Routes>
    <Route path="/" element={<RequireAuth>
     
    </RequireAuth>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/feed" element={<ProtectorRuta>
      <Feed/>
    </ProtectorRuta>}/>
  </Routes>
  </BrowserRouter>);
}