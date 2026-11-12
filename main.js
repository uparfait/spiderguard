// SpiderGuard: blocks distracting sites and apps during focus sessions.
// abc talks to it with JSON-RPC 2.0 over stdin and stdout, one message per
// line. Only protocol messages go to stdout; logs go to stderr.
import { serve } from './src/rpc.js';
import { createApp } from './src/app.js';
import { createMethods } from './src/methods.js';

const app = createApp();

// When stdin closes, abc is gone: lift the blocks and stop.
serve(createMethods(app), () => {
  const done = () => process.exit(0);
  app.shutdown().then(done, done);
  setTimeout(done, 2500).unref();
});
