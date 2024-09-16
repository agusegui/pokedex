"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import Image from "next/image";
import { VFXImg, VFXProvider } from "react-vfx";

// Define our own ShaderPreset type based on available effects
type ShaderPreset =
  | "blink"
  | "duotone"
  | "sinewave"
  | "rgbGlitch"
  | "hueShift"
  | "shine"
  | "spring"
  | "slitScanTransition"
  | "halftone"
  | "warpTransition"
  | "rainbow"
  | "pixelate"
  | "tritone"
  | "glitch"
  | "rgbShift"
  | "uvGradient"
  | "focusTransition"
  | "pixelateTransition";

const typeColors = {
  normal: "bg-gray-400",
  fire: "bg-red-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-blue-200",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-yellow-600",
  flying: "bg-indigo-400",
  psychic: "bg-pink-500",
  bug: "bg-green-400",
  rock: "bg-yellow-700",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-700",
  dark: "bg-gray-700",
  steel: "bg-gray-400",
  fairy: "bg-pink-300",
};

interface Pokemon {
  id: number;
  name: string;
  types: {
    name: string;
    url: string;
  }[];
  moves: {
    name: string;
    type: string;
    url: string;
  }[];
  sprite: string;
  shinySprite: string;
}

interface Type {
  name: string;
  damageRelations: {
    doubleDamageFrom: string[];
    doubleDamageTo: string[];
    halfDamageFrom: string[];
    halfDamageTo: string[];
    noDamageFrom: string[];
    noDamageTo: string[];
  };
}

function TypeModal({
  type,
  onClose,
}: {
  type: Type | null;
  onClose: () => void;
}) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 border-[0.5px] border-gray-300 dark:border-gray-700 p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 capitalize dark:text-white">
          {type.name}
        </h2>
        <div className="mb-4">
          <h3 className="font-semibold dark:text-white">Weaknesses:</h3>
          <p className="dark:text-gray-300">
            {type.damageRelations.doubleDamageFrom.join(", ") || "None"}
          </p>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold dark:text-white">Strengths:</h3>
          <p className="dark:text-gray-300">
            {type.damageRelations.doubleDamageTo.join(", ") || "None"}
          </p>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold dark:text-white">Resistances:</h3>
          <p className="dark:text-gray-300">
            {type.damageRelations.halfDamageFrom.join(", ") || "None"}
          </p>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold dark:text-white">
            Not very effective against:
          </h3>
          <p className="dark:text-gray-300">
            {type.damageRelations.halfDamageTo.join(", ") || "None"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-4 border-[0.5px] border-blue-500 bg-transparent text-blue-500 hover:bg-blue-500 hover:text-white font-bold py-2 px-4 dark:text-blue-400 dark:hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function PokemonImage({ pokemon }: { pokemon: Pokemon }) {
  const [isVFXActive, setIsVFXActive] = useState(false);
  const [isShiny, setIsShiny] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVFXActive(true);
    setTimeout(() => setIsVFXActive(false), 1000);
    setIsShiny(!isShiny);
  };

  useEffect(() => {
    if (isHovered) {
      const img = new window.Image();
      img.src = pokemon.shinySprite;
    }
  }, [isHovered, pokemon.shinySprite]);

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer w-full aspect-square flex items-center justify-center"
    >
      {isVFXActive ? (
        <VFXImg
          src={isShiny ? pokemon.shinySprite : pokemon.sprite}
          alt={pokemon.name}
          shader="glitch"
          overflow={100}
          className="w-full h-full object-contain"
        />
      ) : (
        <Image
          src={isShiny ? pokemon.shinySprite : pokemon.sprite}
          alt={pokemon.name}
          width={150}
          height={150}
          className="w-full h-full object-contain"
        />
      )}
    </div>
  );
}

function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed top-4 right-4 z-50 p-2 bg-gray-200 dark:bg-gray-800 rounded-full"
    >
      {darkMode ? "🌙" : "☀️"}
    </button>
  );
}

export default function Component() {
  const [pokemonData, setPokemonData] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<Type | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);
  const scrollPositionRef = useRef(0);

  const fetchPokemon = useCallback(async () => {
    try {
      setLoading(true);
      const limit = 20;
      const offset = (page - 1) * limit;
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
      );
      const data = await response.json();
      if (data.results.length === 0) {
        setHasMore(false);
        return;
      }
      const pokemonDetails = await Promise.all(
        data.results.map(async (pokemon: { url: string }) => {
          const res = await fetch(pokemon.url);
          const details = await res.json();
          const moves = await Promise.all(
            details.moves
              .slice(0, 3)
              .map(async (move: { move: { name: string; url: string } }) => {
                const moveRes = await fetch(move.move.url);
                const moveDetails = await moveRes.json();
                return {
                  name: moveDetails.name,
                  type: moveDetails.type.name,
                  url: move.move.url,
                };
              })
          );
          return {
            id: details.id,
            name: details.name,
            types: details.types.map(
              (type: { type: { name: string; url: string } }) => ({
                name: type.type.name,
                url: type.type.url,
              })
            ),
            moves: moves,
            sprite: details.sprites.front_default,
            shinySprite: details.sprites.front_shiny,
          };
        })
      );
      setPokemonData((prevData) => {
        const newData = [...prevData, ...pokemonDetails];
        // Remove duplicates based on Pokemon ID
        const uniqueData = Array.from(
          new Map(newData.map((item) => [item.id, item])).values()
        );
        return uniqueData.sort((a, b) => a.id - b.id);
      });
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch Pokémon data. Please try again later.");
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPokemon();
  }, [fetchPokemon]);

  useLayoutEffect(() => {
    window.scrollTo(0, scrollPositionRef.current);
  }, [pokemonData]);

  const lastPokemonElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          scrollPositionRef.current = window.scrollY;
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchTypeDetails = async (url: string) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return {
        name: data.name,
        damageRelations: {
          doubleDamageFrom: data.damage_relations.double_damage_from.map(
            (type: { name: string }) => type.name
          ),
          doubleDamageTo: data.damage_relations.double_damage_to.map(
            (type: { name: string }) => type.name
          ),
          halfDamageFrom: data.damage_relations.half_damage_from.map(
            (type: { name: string }) => type.name
          ),
          halfDamageTo: data.damage_relations.half_damage_to.map(
            (type: { name: string }) => type.name
          ),
          noDamageFrom: data.damage_relations.no_damage_from.map(
            (type: { name: string }) => type.name
          ),
          noDamageTo: data.damage_relations.no_damage_to.map(
            (type: { name: string }) => type.name
          ),
        },
      };
    } catch (err) {
      console.error("Failed to fetch type details:", err);
      return null;
    }
  };

  const handleTypeClick = async (typeUrl: string) => {
    const typeDetails = await fetchTypeDetails(typeUrl);
    if (typeDetails) {
      setSelectedType(typeDetails);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-bounce mb-4">
          <Image
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
            alt="Pokédex"
            width={100}
            height={100}
            className="animate-spin"
          />
        </div>
        <p className="text-xl font-semibold animate-pulse">
          Loading Pokédex...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <VFXProvider>
      <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))] transition-colors duration-300">
        <DarkModeToggle />
        <div className="p-3">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl tracking-tighter font-bold mr-4 text-[rgb(var(--foreground))] transition-colors duration-300">
              Pokédex
            </h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
            {pokemonData.map((pokemon, index) => (
              <div
                key={pokemon.id}
                ref={
                  index === pokemonData.length - 1
                    ? lastPokemonElementRef
                    : null
                }
                className="relative z-0 hover:z-10 transition-all duration-300 aspect-[10/14]"
              >
                <PokemonCard pokemon={pokemon} onTypeClick={handleTypeClick} />
              </div>
            ))}
          </div>
          {loading && (
            <div className="flex justify-center items-center mt-4">
              <p className="dark:text-white">Loading more Pokémon...</p>
            </div>
          )}
        </div>
        <TypeModal type={selectedType} onClose={() => setSelectedType(null)} />
      </div>
    </VFXProvider>
  );
}

const moveTypeEffects: Record<string, ShaderPreset> = {
  normal: "rgbShift",
  fire: "duotone",
  water: "sinewave",
  electric: "rgbGlitch",
  grass: "hueShift",
  ice: "shine",
  fighting: "spring",
  poison: "slitScanTransition",
  ground: "halftone",
  flying: "warpTransition",
  psychic: "rainbow",
  bug: "pixelate",
  rock: "tritone",
  ghost: "glitch",
  dragon: "rgbShift",
  dark: "uvGradient",
  steel: "focusTransition",
  fairy: "pixelateTransition",
};

function PokemonCard({
  pokemon,
  onTypeClick,
}: {
  pokemon: Pokemon;
  onTypeClick: (url: string) => void;
}) {
  const boundingRef = useRef<DOMRect | null>(null);
  const [activeEffect, setActiveEffect] = useState<ShaderPreset | null>(null);

  const handleMoveClick = (move: {
    name: string;
    type: string;
    url: string;
  }) => {
    const effect = moveTypeEffects[move.type] || "glitch";
    setActiveEffect(effect);
    setTimeout(() => setActiveEffect(null), 2000);
  };

  return (
    <div className="flex flex-col [perspective:1000px] h-full">
      <div
        onMouseLeave={() => {
          boundingRef.current = null;
          const card = document.getElementById(`pokemon-card-${pokemon.id}`);
          if (card) {
            card.style.transform =
              "rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)";
            card.style.zIndex = "0";
          }
        }}
        onMouseEnter={(ev) => {
          boundingRef.current = ev.currentTarget.getBoundingClientRect();
          const card = document.getElementById(`pokemon-card-${pokemon.id}`);
          if (card) {
            card.style.zIndex = "10";
          }
        }}
        onMouseMove={(ev) => {
          if (!boundingRef.current) return;
          const x = ev.clientX - boundingRef.current.left;
          const y = ev.clientY - boundingRef.current.top;
          const xPercentage = x / boundingRef.current.width;
          const yPercentage = y / boundingRef.current.height;
          const xRotation = (yPercentage - 0.5) * 20;
          const yRotation = (xPercentage - 0.5) * 20;

          const card = document.getElementById(`pokemon-card-${pokemon.id}`);
          if (card) {
            card.style.transform = `
              rotateX(${xRotation}deg) 
              rotateY(${yRotation}deg) 
              scale(1.1) 
              translateZ(50px)
            `;
          }

          ev.currentTarget.style.setProperty("--x", `${xPercentage * 100}%`);
          ev.currentTarget.style.setProperty("--y", `${yPercentage * 100}%`);
        }}
        id={`pokemon-card-${pokemon.id}`}
        className={`group relative bg-gray-100 dark:bg-gray-800 border-[0.5px] border-gray-400 dark:border-gray-700 p-3 flex flex-col transition-all duration-300 ease-out hover:shadow-xl hover:shadow-gray-400/50 dark:hover:shadow-black/50 rounded-xl overflow-hidden h-full`}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm tracking-tighter font-semibold capitalize text-gray-800 dark:text-white flex items-center">
            <span className="text-gray-500 dark:text-gray-400 mr-1">
              #{pokemon.id.toString().padStart(3, "0")}
            </span>
            {pokemon.name}
          </h2>
        </div>
        <div className="flex flex-wrap mb-1">
          {pokemon.types.map((type) => (
            <button
              key={type.name}
              onClick={() => onTypeClick(type.url)}
              className={`inline-block border-[0.5px] ${
                typeColors[type.name as keyof typeof typeColors]
              } bg-transparent text-gray-800 dark:text-white px-1 py-0.5 text-xs font-semibold mr-1 mb-1 capitalize`}
            >
              {type.name}
            </button>
          ))}
        </div>
        <div className="flex justify-center mb-1 flex-grow">
          {activeEffect ? (
            <VFXImg
              src={pokemon.sprite}
              alt={pokemon.name}
              width={150}
              height={150}
              shader={activeEffect}
              className="w-full h-auto object-contain"
            />
          ) : (
            <PokemonImage pokemon={pokemon} />
          )}
        </div>
        <div className="mt-auto">
          <div className="flex flex-wrap">
            {pokemon.moves.map((move) => (
              <button
                key={move.name}
                onClick={() => handleMoveClick(move)}
                className={`flex items-center border-[0.5px] border-${move.type} bg-transparent text-gray-800 dark:text-white px-1 py-0.5 text-xs font-semibold mr-1 mb-1 capitalize`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    typeColors[move.type as keyof typeof typeColors]
                  } mr-1`}
                ></div>
                {move.name}
              </button>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 group-hover:bg-[radial-gradient(at_var(--x)_var(--y),rgba(255,255,255,0.2)_20%,transparent_80%)] dark:group-hover:bg-[radial-gradient(at_var(--x)_var(--y),rgba(255,255,255,0.1)_20%,transparent_80%)]  rounded-xl" />
      </div>
    </div>
  );
}
