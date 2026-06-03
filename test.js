async function run() {
  const res = await fetch('http://localhost:3000/api/generate-rpph', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  console.log('Status', res.status);
}
run();
