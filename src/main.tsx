import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { I18nextProvider } from "react-i18next";
import App from "./App";
import theme from "./theme";
import "./index.css";
import i18n from "./i18n";
import { Provider } from "react-redux";
import store from "./appStore/store";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Provider store={store}>
          <Toaster position="top-right" />
          <App />
        </Provider>
      </ThemeProvider>
    </I18nextProvider>
  </StrictMode>
);
