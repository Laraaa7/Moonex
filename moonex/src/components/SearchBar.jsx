import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography
} from "@mui/material";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";
import defaultProfile from "../img/PfpDefecto.png";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const positionResults = () => {
    if (inputRef.current && resultsRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      resultsRef.current.style.top = `${rect.bottom + 5}px`; 
      resultsRef.current.style.left = `${rect.left}px`;
      resultsRef.current.style.width = `${rect.width}px`;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        resultsRef.current && 
        !resultsRef.current.contains(event.target)
      ) {
        setResults([]);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", positionResults);
    window.addEventListener("scroll", positionResults);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", positionResults);
      window.removeEventListener("scroll", positionResults);
    };
  }, []);

  // Position results whenever they change
  useEffect(() => {
    if (results.length > 0) {
      setTimeout(positionResults, 0);
    }
  }, [results]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim() === "") {
        setResults([]);
        return;
      }

      const fetchResults = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/busqueda?query=${encodeURIComponent(query)}`);
          if (!res.ok) {
            console.error("Error al buscar:", res.statusText);
            return;
          }
          const data = await res.json();

          const combined = [
            ...data.usuarios.map((u) => ({ type: "usuario", ...u })),
            ...data.posts.map((p) => ({ type: "post", ...p }))
          ];
          setResults(combined);
        } catch (error) {
          console.error("Error al buscar:", error);
        }
      };

      fetchResults();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (item) => {
    if (item.type === "usuario") {
      navigate(`/perfilDeUsuario/${item.username}`);
    } else if (item.type === "post") {
      navigate(`/verPost/${item.id}`);
    }
    setQuery("");
    setResults([]);
  };

  return (
    <div className="search-bar-wrapper">
      <TextField
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar usuarios o posts"
        size="small"
        sx={{
          backgroundColor: "#DAE0EE",
          borderRadius: "20px",
          width: "250px",
          '& .MuiOutlinedInput-root': {
            borderRadius: "20px",
            '& fieldset': { border: 'none' },
            '&:hover fieldset': { border: 'none' },
            '&.Mui-focused fieldset': { border: 'none' }
          },
          '& input': {
            fontSize: '15px',
          }
        }}
        slots={{
          inputAdornedStart: InputAdornment,
        }}
        slotProps={{
          inputAdornedStart: {
            position: "start",
            children: <FaSearch />,
          },
        }}
        InputProps={{
          inputRef: inputRef,
        }}
      />
      {results.length > 0 && (
        <List className="search-results" ref={resultsRef}>
          {results.map((item, index) => (
            <ListItem button key={index} onClick={() => handleSelect(item)}>
              {item.type === "usuario" ? (
                <>
                  <ListItemAvatar>
                    <Avatar
                      src={
                        item.foto_perfil?.startsWith("data:") || item.foto_perfil?.startsWith("http")
                          ? item.foto_perfil
                          : defaultProfile
                      }
                      alt={item.nombre}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight="bold">
                        {item.nombre}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="textSecondary">
                        @{item.username}
                      </Typography>
                    }
                  />
                </>
              ) : (
                <>
                  <ListItemAvatar>
                    <Avatar>
                      📝
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight="bold">
                        {item.titulo}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="textSecondary">
                        Post reciente
                      </Typography>
                    }
                  />
                </>
              )}
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

export default SearchBar;