console.log("Processor worker starting...");

// In real implementation:
// - poll SQS for messages
// - simulate transcoding / thumbnail generation
// - update DB / S3

async function main() {
  console.log("Worker loop stub – connect to SQS here");
  // Example infinite loop: poll, process, sleep
  while (true) {
    console.log("Checking for messages...");
    await new Promise((r) => setTimeout(r, 5000));
  }
}

main().catch((err) => {
  console.error("Worker crashed:", err);
  process.exit(1);
});
