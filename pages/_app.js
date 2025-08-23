import "@/styles/globals.css";
import { FavoritesProvider } from "./context/FavoriteContext";

export default function App({ Component, pageProps }) {
  
 return (
    <FavoritesProvider>
      <Component {...pageProps} />
    </FavoritesProvider>
  );
}
