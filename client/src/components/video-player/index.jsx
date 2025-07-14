import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";

function VideoPlayer({
  width = "100%",
  height = "100%",
  url,
  onProgressUpdate,
  progressData,
}) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  function handlePlayAndPause() {
    setPlaying(!playing); // toggle playing state
  }

  function handleProgress(state) {
    if (!seeking) {
      setPlayed(state.played); // update played state with current progress
    }
  }

  function handleRewind() {
    playerRef?.current?.seekTo(playerRef?.current?.getCurrentTime() - 5); // rewind by 5 seconds
  }

  function handleForward() {
    playerRef?.current?.seekTo(playerRef?.current?.getCurrentTime() + 5); // forward by 5 seconds
  }

  function handleToggleMute() {
    setMuted(!muted); // toggle mute state
  }

  function handleSeekChange(newValue) {
    setPlayed(newValue[0]); // update played state with new value
    setSeeking(true); // set seeking state to true
  }

  function handleSeekMouseUp() { // handle mouse up event after seeking
    setSeeking(false); // set seeking state to false
    playerRef.current?.seekTo(played); // seek to the new played value
  }

  function handleVolumeChange(newValue) {
    setVolume(newValue[0]);
  }

  function pad(string) { // pad single digit numbers with leading zero
    return ("0" + string).slice(-2); // pad single digit numbers with leading zero
  }

  function formatTime(seconds) { // format time in HH:MM:SS or MM:SS format
    const date = new Date(seconds * 1000); // convert seconds to milliseconds
    const hh = date.getUTCHours(); // get hours
    const mm = date.getUTCMinutes(); // get minutes
    const ss = pad(date.getUTCSeconds()); // get seconds

    if (hh) {
      return `${hh}:${pad(mm)}:${ss}`; // return HH:MM:SS format if hours are present
    }

    return `${mm}:${ss}`; // return MM:SS format if hours are not present
  }

  const handleFullScreen = useCallback(() => {
    if (!isFullScreen) {
      if (playerContainerRef?.current.requestFullscreen) {
        playerContainerRef?.current?.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullScreen]);

  function handleMouseMove() {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  }

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  useEffect(() => {
    if (played === 1) {
      onProgressUpdate({
        ...progressData,
        progressValue: played,
      });
    }
  }, [played]);

  return (
    <div // main container for the video player
      ref={playerContainerRef}
      className={`relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ease-in-out 
      ${isFullScreen ? "w-screen h-screen" : ""}
      `}
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <ReactPlayer // ReactPlayer component for video playback
        ref={playerRef} 
        className="absolute top-0 left-0"
        width="100%"
        height="100%"
        url={url} // video URL
        playing={playing}
        volume={volume}
        muted={muted}
        onProgress={handleProgress}
      />  
      {showControls && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-75 p-4 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`} // controls container
        >
          <Slider
            value={[played * 100]}
            max={100}
            step={0.1}
            onValueChange={(value) => handleSeekChange([value[0] / 100])} // handle seek change
            onValueCommit={handleSeekMouseUp} // handle seek mouse up
            className="w-full mb-4"// slider for video progress
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayAndPause} // play and pause button
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
              >
                {playing ? (
                  <Pause className="h-6 w-6" /> /* pause icon and play icon */
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>
              <Button
                onClick={handleRewind}
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                variant="ghost" // rewind button
                size="icon"
              >
                <RotateCcw className="h-6 w-6" />
              </Button>
              <Button
                onClick={handleForward}
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                variant="ghost"
                size="icon"// forward button
              >
                <RotateCw className="h-6 w-6" /> 
              </Button>
              <Button
                onClick={handleToggleMute}
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                variant="ghost"
                size="icon"// mute button
              >
                {muted ? (
                  <VolumeX className="h-6 w-6" /> // mute icon
                ) : (
                  <Volume2 className="h-6 w-6" /> // volume icon
                )}
              </Button>
              <Slider
                value={[volume * 100]}
                max={100} // slider for volume control
                step={1}
                onValueChange={(value) => handleVolumeChange([value[0] / 100])}
                className="w-24 "
              />
            </div>
            <div className="flex items-center space-x-2"> 
              <div className="text-white">
                {formatTime(played * (playerRef?.current?.getDuration() || 0))}/{" "} 
                {formatTime(playerRef?.current?.getDuration() || 0)} 
              </div>
              <Button
                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                variant="ghost"
                size="icon" // full screen button
                onClick={handleFullScreen}
              >
                {isFullScreen ? (
                  <Minimize className="h-6 w-6" /> // minimize icon
                ) : (
                  <Maximize className="h-6 w-6" /> // maximize icon
                )}
              </Button>
            </div>
          </div>
        </div>
      )} 
    </div>
  );
}

export default VideoPlayer;
