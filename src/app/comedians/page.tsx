// "use client";

// import React, { useState, useCallback, useRef } from "react";
// import axios from "axios";

// interface Comedian {
//   id: string;
//   name: string;
//   oneLiner: string;
//   pictureUrl: string;
//   websiteUrl: string;
//   mediaConnections: {
//     netflix?: string;
//     hulu?: string;
//     amazon?: string;
//     youtube?: string;
//     twitter?: string;
//     instagram?: string;
//     spotify?: string;
//     appleMusic?: string;
//     pandora?: string;
//   };
// }

// // Custom debounce function
// const useDebounce = (func: (...args: any[]) => void, delay: number) => {
//   const timeoutRef = useRef<NodeJS.Timeout>();

//   return useCallback(
//     (...args: any[]) => {
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//       timeoutRef.current = setTimeout(() => func(...args), delay);
//     },
//     [func, delay]
//   );
// };

// const ComediansPage: React.FC = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [comedians, setComedians] = useState<Comedian[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const performSearch = async () => {
//     if (!searchTerm.trim()) {
//       setError("Please enter a search term");
//       return;
//     }

//     setIsLoading(true);
//     setError("");
//     try {
//       const response = await axios.get(`/api/comedians?search=${searchTerm}`);
//       setComedians(response.data);
//       if (response.data.length === 0) {
//         setError("No comedians found. Try a different search term.");
//       }
//     } catch (error) {
//       console.error("Error searching comedians:", error);
//       setError("Failed to fetch comedians. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const debouncedSearch = useDebounce(performSearch, 300);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//     debouncedSearch();
//   };

//   const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") {
//       performSearch();
//     }
//   };

//   return (
//     <div className="screen-container">
//       <h1 className="title">Search for Comedians</h1>
//       <div className="card-style mb-6">
//         <input
//           type="text"
//           placeholder="Search by name"
//           value={searchTerm}
//           onChange={handleInputChange}
//           onKeyPress={handleKeyPress}
//           className="standard-input w-full mb-4"
//         />
//         <button onClick={performSearch} className="neu-button">
//           Search
//         </button>
//       </div>

//       {isLoading && <div className="loading-indicator">Loading...</div>}
//       {error && <div className="error-message">{error}</div>}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {comedians.map((comedian) => (
//           <div key={comedian.id} className="card-style1">
//             <img
//               src={comedian.pictureUrl}
//               alt={comedian.name}
//               className="w-full h-48 object-cover rounded-xl mb-4"
//             />
//             <h2 className="subtitle-style">{comedian.name}</h2>
//             <p className="text-zinc-300 mb-2">{comedian.oneLiner}</p>
//             <a
//               href={comedian.websiteUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-orange-500"
//             >
//               Website
//             </a>
//             <div className="mt-2">
//               {Object.entries(comedian.mediaConnections).map(
//                 ([key, value]) =>
//                   value && (
//                     <a
//                       key={key}
//                       href={value}
//                       className="text-blue-500 mr-2"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       {key.charAt(0).toUpperCase() + key.slice(1)}
//                     </a>
//                   )
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ComediansPage;
