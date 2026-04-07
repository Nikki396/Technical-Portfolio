const channel = new BroadcastChannel('thames-channel');
    const statusEl = document.getElementById('status');

    // -------------------------
    // MODE BUTTONS
    // -------------------------
    document.querySelectorAll('button[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        channel.postMessage({ mode });
        statusEl.textContent = `sent: ${mode}`;
      });
    });

    // -------------------------
    // VOLUME SLIDER
    // -------------------------
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeLabel = document.getElementById('volumeLabel');

    volumeSlider.addEventListener('input', () => {
      const volume = parseFloat(volumeSlider.value);
      volumeLabel.textContent = volume.toFixed(2);
      channel.postMessage({ volume });
    });

    // -------------------------
    // PLAY / PAUSE BUTTON
    // -------------------------
    let isPlaying = true;
    const playPauseBtn = document.getElementById('playPause');

    playPauseBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      channel.postMessage({ playPause: isPlaying });
      playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
      statusEl.textContent = isPlaying ? 'Music Playing' : 'Music Paused';
    });