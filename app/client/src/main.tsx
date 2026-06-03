
  import "@/styles/globals.css";

  import App from "./App.tsx"

  import { StrictMode } from "react"
  import { createRoot } from "react-dom/client"

  import { ThemeProvider } from "@/components/theme-provider.tsx"
  import { UserProvider } from "@/context/UserContext.tsx"
  import { TooltipProvider } from "@/components/ui/tooltip"
  import { BrowserRouter } from "react-router-dom";
  import { Toaster } from "sonner";


  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <UserProvider>
          <ThemeProvider defaultTheme="light" >
            <TooltipProvider>
              <App />
              <Toaster position="top-center" />
            </TooltipProvider>
          </ThemeProvider>
        </UserProvider>
      </BrowserRouter>
    </StrictMode>
  )
