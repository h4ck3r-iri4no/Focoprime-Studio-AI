// 🔥 IMPORTS FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ⚠️ CONFIGURAÇÃO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyD0e-w-clS29jxcGT1wL5HC8i-8nZJXV7o",
  authDomain: "focoprime-a2913.firebaseapp.com",
  databaseURL: "https://focoprime-a2913-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "focoprime-a2913",
  appId: "1:163306607632:web:bdb097981bef1c7c72e695"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// ===============================
// 🔐 PROTEGER PÁGINAS E CARREGAR PROFILE
// ===============================
onAuthStateChanged(auth, async (user) => {
  const isLoginPage = window.location.pathname.includes("login.html");

  if (!user && !isLoginPage) {
    window.location.href = "login.html";
    return;
  }

  if (user && isLoginPage) {
    window.location.href = "index.html";
    return;
  }

  if (user) {
    const uid = user.uid;
    const userRef = ref(database, 'users/' + uid);

    // ✅ Verifica se o usuário já tem dados
    let snapshot = await get(userRef);
    if (!snapshot.exists()) {
      await set(userRef, {
        name: user.displayName || "Usuário",
        email: user.email || "",
        role: "Pro Trader",
        phone: "",
        bio: "",
        createdAt: new Date().toISOString()
      });
      console.log("Dados do usuário criados automaticamente!");
      snapshot = await get(userRef);
    }

    const data = snapshot.val();

    // SELECTORES
    const profileName = document.querySelector(".profile-info h2");
    const profileEmail = document.querySelector(".profile-info p");
    const profileBadge = document.querySelector(".profile-badge");

    const inputFirstName = document.getElementById("firstName");
    const inputLastName = document.getElementById("lastName");
    const inputEmail = document.getElementById("email");
    const inputPhone = document.getElementById("phone");
    const inputBio = document.getElementById("bio");
    const saveBtn = document.getElementById("saveProfileBtn");

    // Preenche profile e inputs
    const nameParts = (data.name || "").split(" ");
    if (inputFirstName) inputFirstName.value = nameParts[0] || "";
    if (inputLastName) inputLastName.value = nameParts[1] || "";
    if (inputEmail) inputEmail.value = data.email || "";
    if (inputPhone) inputPhone.value = data.phone || "";
    if (inputBio) inputBio.value = data.bio || "";

    if (profileName) profileName.textContent = data.name || "Usuário";
    if (profileEmail) profileEmail.textContent = data.email || "";
    if (profileBadge) profileBadge.textContent = data.role || "Pro Trader";

    // SALVAR ALTERAÇÕES
    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        try {
          const updatedData = {
            name: `${inputFirstName.value} ${inputLastName.value}`,
            email: inputEmail.value,
            phone: inputPhone.value,
            bio: inputBio.value,
            role: profileBadge.textContent
          };
          await update(userRef, updatedData);

          if (profileName) profileName.textContent = updatedData.name;
          if (profileEmail) profileEmail.textContent = updatedData.email;

          alert("Perfil atualizado com sucesso!");
        } catch (err) {
          console.error("Erro ao salvar dados:", err);
          alert("Não foi possível atualizar o perfil.");
        }
      });
    }
  }
});

// ===============================
// 🔑 LOGIN EMAIL
// ===============================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector("input[type='email']").value;
    const password = loginForm.querySelector("input[type='password']").value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "index.html";
    } catch (error) {
      alert(error.message);
    }
  });
}

// ===============================
// 🆕 REGISTRO
// ===============================
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = registerForm.querySelector("input[type='text']").value;
    const email = registerForm.querySelector("input[type='email']").value;
    const password = registerForm.querySelector("input[type='password']").value;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await set(ref(database, 'users/' + user.uid), {
        name,
        email,
        role: "Pro Trader",
        phone: "",
        bio: "",
        createdAt: new Date().toISOString()
      });

      alert("Conta criada com sucesso!");
      window.location.href = "index.html";
    } catch (error) {
      alert(error.message);
    }
  });
}

// ===============================
// 🌍 LOGIN COM GOOGLE
// ===============================
const googleButtons = document.querySelectorAll(".social-btn");
googleButtons.forEach((btn) => {
  if (btn.textContent.includes("Google")) {
    btn.addEventListener("click", async () => {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Cria dados caso não existam
        const userRef = ref(database, 'users/' + user.uid);
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
          await set(userRef, {
            name: user.displayName || "Usuário",
            email: user.email || "",
            role: "Pro Trader",
            phone: "",
            bio: "",
            createdAt: new Date().toISOString()
          });
        }

        window.location.href = "index.html";
      } catch (error) {
        alert(error.message);
      }
    });
  }
});

// ===============================
// 🚪 LOGOUT
// ===============================
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
      }
