"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ToolsPreview.module.css";
import ide from "./ToolsIde.module.css";

const stages = ["Integrate", "Test", "Deploy"];
// The Go example follows the public cmd/discover.go page-capture flow.
// Integration files are explanatory pseudocode, not private SDK contracts.
const files = [
  { group: "webscan / cmd", name: "discover.go", language: "Go · adapted excerpt", code: `// Webscan's CLI builds configuration, then captures a page.
// Adapted from method-security/webscan/cmd/discover.go.
// Flag parsing and error handling are abbreviated here.
package cmd

// Inside the discover page command's Run handler:
target, err := cmd.Flags().GetString("target")
if err != nil {
    a.OutputSignal.AddError(err)
    return
}

// Configuration carries the target and capture settings.
config := getDiscoverPageConfig(
    target, responseCodes, maxRedirects, verifyTLS,
    timeout, ignoreCrossDomainRedirects, takeScreenshot,
    userAgentPreset, requestMethodConfig.RequestMethodEnum,
    requestMethodConfig.HeadlessConfig,
    requestMethodConfig.BrowserbaseConfig,
)

report := discoverpage.PerformPageCapture(
    ctx, config, requestMethodConfig.BrowserbaseSecrets,
)
// A structured signal is the boundary to the processor.
a.OutputSignal.Content = report` },
  { group: "method integration", name: "tool.yaml", language: "YAML", code: `# A small contract around your existing tool.
# This manifest illustrates the integration, not an SDK schema.
name: web-page-discovery
input:
  target: URL

# Compiler: turn mission inputs into executable work.
compiler: compiler.py

# Processor: turn returned signals into ontology objects.
processor: processor.py
outputs:
  - WebPage

# Keep the binary separate from the integration code.
command: webscan discover page` },
  { group: "method integration", name: "compiler.py", language: "Python", code: `# COMPILER: mission input → executable work
# Illustrative contract; no command runs in this preview.
def compile_tool(inputs):
    target = inputs["target"]

    # Arguments stay separate: don't interpolate into a shell.
    # Webscan owns the capture logic; the compiler describes
    # how to call it with this mission's input.
    return {
        "executable": "webscan",
        "arguments": [
            "discover", "page",
            "--target", target,
        ],
        "processor": "processor.py",
    }

# Next: the runtime returns a signal to the processor.
# Open processor.py to see how it becomes mission context.` },
  { group: "method integration", name: "processor.py", language: "Python", code: `# PROCESSOR: signal → ontology
# A normalized fixture keeps this example readable.
# Real processors use Method's typed ontology constructors.
def process_signal(signal):
    page = signal["content"]

    # Use a stable identity so repeated observations enrich
    # the same object instead of creating duplicates.
    return {
        "type": "WebPage",
        "key": page["url"],
        "properties": {
            "url": page["url"],
            "title": page["title"],
            "statusCode": page["status"],
        },
    }

# Tools produce signals. Processors give those signals
# meaning: typed objects operators and agents can use.
# Compare fixtures/signal.json with ontology.json.` },
  { group: "fixtures", name: "signal.json", language: "JSON · normalized sample", code: `{
  "content": {
    "url": "https://example.com",
    "title": "Example Domain",
    "status": 200
  }
}` },
  { group: "fixtures", name: "ontology.json", language: "JSON", code: `{
  "type": "WebPage",
  "key": "https://example.com",
  "properties": {
    "url": "https://example.com",
    "title": "Example Domain",
    "statusCode": 200
  }
}` },
];

function Code({ source }: { source: string }) {
  return <pre className={ide.code}><code>{source.split("\n").map((line, index) => <span className={ide.line} key={index}><span className={ide.lineNumber} aria-hidden="true">{index + 1}</span><span className={line.trim().startsWith("#") || line.trim().startsWith("//") ? ide.comment : undefined}>{line || " "}</span>{"\n"}</span>)}</code></pre>;
}

export default function ToolsPreview() {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const preview = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setMotionAllowed(!media.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    if (preview.current) observer.observe(preview.current);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  // Preserve elapsed time on hover. Explicit interaction gives control to the
  // visitor for the rest of this preview, including keyboard and touch input.
  useEffect(() => {
    if (hovered || interacted || !visible || !motionAllowed || !pageVisible) return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      elapsed.current += now - previous;
      previous = now;
      if (elapsed.current >= 7000) {
        elapsed.current = 0;
        setStage(current => (current + 1) % stages.length);
      }
      setProgress(elapsed.current / 7000);
    }, 50);
    return () => window.clearInterval(timer);
  }, [hovered, interacted, visible, motionAllowed, pageVisible]);

  function selectStage(next: number) {
    elapsed.current = 0;
    setProgress(0);
    setStage(next);
  }
  const [file, setFile] = useState("compiler.py");
  const [test, setTest] = useState<"idle" | "running" | "passed">("idle");
  const [release, setRelease] = useState(0);
  const chatBody = useRef<HTMLDivElement>(null);
  const selected = files.find(item => item.name === file)!;

  // Both the invitation and test playback stop when leaving Test.
  // A manual response cancels the automatic response through cleanup.
  useEffect(() => {
    if (stage !== 1 || test === "passed") return;
    const timer = window.setTimeout(() => setTest(test === "idle" ? "running" : "passed"), test === "idle" ? 5000 : 1400);
    return () => window.clearTimeout(timer);
  }, [stage, test]);

  useEffect(() => {
    if (stage !== 2 && chatBody.current) {
      chatBody.current.scrollTop = chatBody.current.scrollHeight;
    }
  }, [stage, test]);

  function reset() { selectStage(0); setFile("compiler.py"); setTest("idle"); setRelease(0); }

  return <div ref={preview} className={`${styles.demo} ${ide.preview}`}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onPointerDownCapture={() => setInteracted(true)} onKeyDownCapture={() => setInteracted(true)}
    onFocusCapture={() => setInteracted(true)} onWheelCapture={() => setInteracted(true)}>
    <div className={`${styles.topline} ${ide.toolbar}`}>
      <p className={ide.description}>Method provides a world-class developer experience for building Tools. Every Tool is backed by a git repository to support full git workflows. Method&apos;s MCP enables rapid, AI-augmented tool dev, from building, integration, testing, to deployment and upgrading. And you can do this all in Method&apos;s web-based Code Editor or build locally in your preferred IDE.</p>
      <nav className={`${styles.workflow} ${ide.stageTabs}`} aria-label="Tool development workflow">
        {stages.map((label, index) => <button key={label} aria-current={stage === index ? "step" : undefined} onClick={() => selectStage(index)}>{label}<span className={ide.stageProgress} aria-hidden="true"><span style={{ transform: `scaleX(${stage === index ? progress : 0})` }} /></span></button>)}
      </nav>
    </div>
    <div className={ide.card}>
    <div className={ide.workspace}>
      <aside className={ide.sidePanel} aria-label={stage === 2 ? "Source control and publishing" : "AI Chat"}>
        <div className={ide.panelHeader}>{stage === 2 ? "⑂  Source control & publish" : "AI Chat"}</div>
        <div className={ide.sideBody} data-lenis-prevent ref={chatBody} tabIndex={0} aria-label={stage === 2 ? "Publishing controls" : "Chat history"}>
          {stage !== 2 ? <>
            <p className={ide.userMessage}>Let’s make Webscan’s page discovery available in Method.</p>
            <p className={ide.assistantMessage}>Keep the Go tool. I’ll add a compiler for execution and a processor that turns its output into WebPage objects.</p>
            <p className={ide.userMessage}>Can we keep the command-line tool as it is?</p>
            <p className={ide.assistantMessage}>Yes. The Go command still handles page capture. The integration lives alongside it, so you can update either independently.</p>
            <p className={ide.userMessage}>Walk me through what you added.</p>
            <p className={ide.assistantMessage}>tool.yaml describes the inputs and output. compiler.py turns the target URL into Webscan arguments. processor.py maps the returned signal into a typed object.</p>
            <p className={ide.userMessage}>What happens if we discover the same page again?</p>
            <p className={ide.assistantMessage}>The processor uses the URL as a stable identity. The next observation can enrich the same WebPage, instead of making a duplicate.</p>
            <p className={ide.userMessage}>Let’s include a sample we can test without running a scan.</p>
            <p className={ide.assistantMessage}>Added signal.json and the expected ontology.json. Compare them to see how the raw result becomes mission context.</p>
            {stage === 0 ? <><p className={ide.userMessage}>So operators and agents can use what it finds?</p><p className={ide.assistantMessage}>Exactly. The compiler defines the work; the processor adds the results to the ontology. Take a look through the files.</p></> : <div aria-live="polite">
              <p className={ide.assistantMessage}>Ready to test the compiler and processor against our sample?</p>
              {test === "idle" ? <><button className={ide.reply} onClick={() => setTest("running")}>Yes, please test <span aria-hidden="true">↵</span></button><p className={ide.hint}>Click to reply · auto-plays after 5 seconds</p></> : <><p className={ide.userMessage}>Yes, please test.</p><p className={ide.assistantMessage}>{test === "running" ? "Checking the command and processing the sample signal…" : "All checks passed. The sample produces a WebPage object, ready for mission context."}</p>{test === "passed" && <div className={ide.checks}><span>✓ Compiler builds the Webscan command</span><span>✓ Processor returns a typed object</span><span>✓ URL preserved as object identity</span></div>}</>}
            </div>}
          </> : <div aria-live="polite">
            <p className={ide.branch}>⑂ feat/page-discovery</p>
            <p className={ide.muted}>{release === 0 ? "3 integration files ready to commit" : release === 1 ? "1 commit ready to push" : "Branch is up to date"}</p>
            <div className={ide.changes}>{["tool.yaml", "compiler.py", "processor.py"].map(name => <span key={name}>{release === 0 ? "M" : "✓"} <span>{name}</span></span>)}</div>
            <div className={ide.commitMessage}>Add Webscan page integration</div>
            <button className={ide.control} disabled={release !== 0} onClick={() => setRelease(1)}>{release > 0 ? "✓ Committed" : "Commit changes"}</button>
            <button className={ide.control} disabled={release !== 1} onClick={() => setRelease(2)}>{release > 1 ? "✓ Pushed" : "Push to remote"}</button>
            <div className={ide.publish}><p>Publish to Method</p><span>Web page discovery · v1.0</span><button className={ide.reply} disabled={release !== 2 || test !== "passed"} onClick={() => setRelease(3)}>{release === 3 ? "✓ Deployed" : "Deploy tool"}</button>
              {test !== "passed" && <button className={ide.textButton} onClick={() => selectStage(1)}>Run the sample test first →</button>}
              {release === 3 && <p className={ide.success}>Available to operators and agents in this preview.</p>}
            </div>
          </div>}
        </div>
        {stage !== 2 && <div className={ide.composer}>
          <textarea aria-label="Message AI (notional preview)" placeholder="Message AI…" readOnly rows={2} />
          <div><span>Preview conversation</span><button disabled aria-label="Send message (preview only)">↑</button></div>
        </div>}
      </aside>
      <aside className={ide.tree} aria-label="Tool files">
        <div className={ide.panelHeader}>Explorer</div>
        <div className={ide.treeBody}>{files.map((item, index) => <div key={item.name}>
          {(index === 0 || files[index - 1].group !== item.group) && <p className={ide.folder}>⌄ {item.group}</p>}
          <button aria-pressed={file === item.name} onClick={() => setFile(item.name)}><span className={ide.fileIcon} aria-hidden="true">{item.name.endsWith(".py") ? "py" : item.name.endsWith(".go") ? "go" : "{}"}</span>{item.name}</button>
        </div>)}</div>
      </aside>
      <div className={ide.openFile}>
        <div className={ide.panelHeader}><span>{selected.name}</span><span className={ide.language}>{selected.language}</span></div>
        <div className={ide.fileContent} tabIndex={0} aria-label={`${selected.name} source`}><Code source={selected.code} /></div>
        <div className={ide.editorStatus}><span>⑂ Branch: feat/page-discovery</span></div>
      </div>
    </div>
    <div className={styles.footnote}><span>Notional example based on real Method tooling. <a href="https://github.com/method-security/" target="_blank" rel="noreferrer">See GitHub for the full set of Method’s open-source tools.</a></span>{stage !== 0 && <button onClick={reset}>Reset</button>}</div>
    </div>
  </div>;
}
