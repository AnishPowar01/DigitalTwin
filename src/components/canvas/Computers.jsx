import axios from "axios";
import React, { Suspense, useEffect, useState } from "react";
import { Canvas, events } from "@react-three/fiber";
import { Html, OrbitControls, Preload, useGLTF } from "@react-three/drei";

import About from "../About";

import CanvasLoader from "../Loader";

import "./Modal.css";

const Computers = ({ isMobile }) => {
  const computer = useGLTF("./desktop_pc/scene.gltf");
  const [weatherData, setWeatherData] = useState(null);

  const getWeatherData = async () => {
    const apiKey = "24da00112bba29f799be5b212bd5b707";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=Pune,IN&appid=${apiKey}`;
    try {
      const response = await axios.get(url);
      setWeatherData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getWeatherData();
  }, []);

  const handleCloseModal = () => {
    const modal = document.querySelector(".modal");
    modal.remove();
    modal
      .querySelector(".close-button")
      .removeEventListener("click", handleCloseModal);
    setWeatherData(null);
  };

  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor="black" />
      <spotLight
        position={[-20, 50, 10]}
        angle={0.12}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize={1024}
      />
      <pointLight intensity={1} />
      <primitive
        object={computer.scene}
        scale={isMobile ? 0.7 : 0.75}
        position={isMobile ? [0, -3, -2.2] : [0, -3.25, -1.5]}
        rotation={[-0.01, -0.2, -0.1]}
        onClick={(event) => {
          if (event.object.name === "glass_0") {
            // Open the modal when the glass is clicked
            event.stopPropagation();
            const modal = document.createElement("div");
            modal.className = "modal";
            modal.innerHTML = `
    <div class="modal-content">
      <span class="close-button">&times;</span>
      ${
        weatherData
          ? `
          <h2>Room 1</h2>
          <p>Temperature: ${weatherData ? (weatherData.main.temp - 273.15).toFixed(1) : "Loading..."}°C</p>
          <p>Humidity: ${weatherData.main.humidity}%</p>
        `
          : "<p>Loading...</p>"
      }
    </div>
  `;
            modal.addEventListener("click", (event) => {
              if (event.target.classList.contains("modal")) {
                handleCloseModal();
              }
            });
            modal
              .querySelector(".close-button")
              .addEventListener("click", handleCloseModal);
            document.body.appendChild(modal);
          }
        }}
      />
    </mesh>
  );
};

const ComputersCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Add a listener for changes to the screen size
    const mediaQuery = window.matchMedia("(max-width: 500px)");

    // Set the initial value of the `isMobile` state variable
    setIsMobile(mediaQuery.matches);

    // Define a callback function to handle changes to the media query
    const handleMediaQueryChange = (event) => {
      setIsMobile(event.matches);
    };

    // Add the callback function as a listener for changes to the media query
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    // Remove the listener when the component is unmounted
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  return (
    <Canvas
      frameloop="demand"
      shadows
      dpr={[1, 2]}
      camera={{ position: [20, 3, 5], fov: 25 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense>
        <OrbitControls
        // enableZoom={false}
        // maxPolarAngle={Math.PI / 2}
        // minPolarAngle={Math.PI / 2}
        />
        <Computers isMobile={isMobile} />
      </Suspense>

      <Preload all />
    </Canvas>
  );
};

export default ComputersCanvas;
