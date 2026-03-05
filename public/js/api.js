// api.js
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();
const database = getDatabase();

const focoPrimeInput = document.getElementById("focoPrimeKey");
const copyBtn = document.getElementById("copyKeyBtn");
const regenBtn = document.getElementById("regenKeyBtn");

onAuthStateChanged(auth, async (user) => {
  if (!user) return; // não logado, nada faz

  const uid = user.uid;

  try {
    const snapshot = await get(ref(database, 'users/' + uid + '/focoPrimeKey'));
    if (snapshot.exists()) {
      focoPrimeInput.value = snapshot.val();
    } else {
      const newKey = 'fp_' + Math.random().toString(36).substr(2, 32);
      await set(ref(database, 'users/' + uid + '/focoPrimeKey'), newKey);
      focoPrimeInput.value = newKey;
    }
  } catch (err) {
    console.error("Erro ao carregar API Key:", err);
  }
});

// Copiar key
copyBtn.addEventListener("click", () => {
  focoPrimeInput.select();
  document.execCommand("copy");
  alert("API Key copiada!");
});

// Regenerar key
regenBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Usuário não autenticado!");

  const newKey = 'fp_' + Math.random().toString(36).substr(2, 32);
  try {
    await update(ref(database, 'users/' + user.uid), { focoPrimeKey: newKey });
    focoPrimeInput.value = newKey;
    alert("Nova API Key gerada!");
  } catch (err) {
    console.error("Erro ao gerar nova key:", err);
    alert("Não foi possível gerar a nova API Key.");
  }
});
