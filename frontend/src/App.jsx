import { UserContextProvider } from "./context/user.context";
import AppRoutes from "./routes/AppRoutes";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <>
      <UserContextProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </UserContextProvider>
    </>
  );
}

export default App;
