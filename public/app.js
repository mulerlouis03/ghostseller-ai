async function testHealth(){
  const res = await fetch("/api/health");
  const data = await res.json();
  document.getElementById("out").textContent = JSON.stringify(data,null,2);
}
testHealth();
