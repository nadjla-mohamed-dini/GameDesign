let context = null;
let muted = false;
let drone = null;
let stepAt = 0;
let beatAt = 0;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  if (muted) {
    rest();
  } else {
    unlock();
  }
  return muted;
}

export function unlock() {
  const audio = machine();
  if (!audio) {
    return;
  }
  if (audio.state === "suspended") {
    audio.resume();
  }
  if (!drone) {
    startDrone(audio);
  }
}

export function rest() {
  if (drone) {
    drone.gain.gain.value = 0;
    drone.low.stop();
    drone.high.stop();
    drone = null;
  }
}

export function presence({ moving, hp, now }) {
  const audio = machine();
  if (!audio) {
    return;
  }
  if (!drone) {
    startDrone(audio);
  }
  if (moving && now - stepAt > 420) {
    stepAt = now;
    noise(audio, 0.045, 180, 0.035);
  }
  if (hp <= 40 && now - beatAt > 860) {
    beatAt = now;
    blip(audio, 62, 0.09, "sine", 0.05);
  }
}

export function seal() {
  const audio = machine();
  if (!audio) {
    return;
  }
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(160, audio.currentTime);
  osc.frequency.exponentialRampToValueAtTime(48, audio.currentTime + 0.34);
  gain.gain.setValueAtTime(0.05, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.36);
  osc.connect(gain).connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + 0.38);
}

export function wound() {
  const audio = machine();
  if (!audio) {
    return;
  }
  noise(audio, 0.14, 90, 0.07);
}

function machine() {
  if (muted) {
    return null;
  }
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    return null;
  }
  if (!context) {
    try {
      context = new AudioContext();
    } catch {
      return null;
    }
  }
  return context;
}

function startDrone(audio) {
  const gain = audio.createGain();
  gain.gain.value = 0.018;
  const low = audio.createOscillator();
  const high = audio.createOscillator();
  low.type = "sine";
  high.type = "triangle";
  low.frequency.value = 55;
  high.frequency.value = 82;
  low.connect(gain);
  high.connect(gain);
  gain.connect(audio.destination);
  low.start();
  high.start();
  drone = { low, high, gain };
}

function blip(audio, freq, duration, type, volume) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + duration + 0.02);
}

function noise(audio, duration, frequency, volume) {
  const length = Math.floor(audio.sampleRate * duration);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = audio.createBufferSource();
  source.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = frequency;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  source.connect(filter).connect(gain).connect(audio.destination);
  source.start();
}
