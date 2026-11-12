// One soft chime when a phase ends: a quiet sine tone that fades out.
SG.chime = function chime() {
  try {
    const ctx = new AudioContext();
    const tone = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    tone.type = 'sine';
    tone.frequency.setValueAtTime(660, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    tone.connect(gain).connect(ctx.destination);
    tone.start(t);
    tone.stop(t + 1.7);
    tone.onended = () => ctx.close();
  } catch (err) {
    // No sound device: the notice is enough.
  }
};
