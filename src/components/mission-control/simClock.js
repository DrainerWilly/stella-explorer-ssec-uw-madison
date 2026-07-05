// A plain (non-React) simulation clock. It is advanced once per animation frame
// by MissionControlPage's driver and read by the 3D scene and the time bar.
// Keeping it outside React state avoids a re-render on every frame.

export function createSimClock() {
  return {
    time: Date.now(), // simulation time, ms since epoch
    playing: true,
    speed: 1, // default simulation speed (Live mode runs at real rate)
    following: true, // Live/Now mode: snap to wall-clock at 1× — default view

    // Advance by a real elapsed time (seconds). Respects play/speed/following.
    advance(dtSeconds) {
      if (this.following) {
        this.time = Date.now()
        return
      }
      if (this.playing) {
        this.time += dtSeconds * 1000 * this.speed
      }
    },

    getDate() {
      return new Date(this.time)
    },
  }
}
