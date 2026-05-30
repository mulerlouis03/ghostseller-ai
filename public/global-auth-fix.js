(function(){
  function getToken(){
    return localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("ghostseller_token") ||
      localStorage.getItem("jwt") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("authToken") ||
      sessionStorage.getItem("ghostseller_token") ||
      sessionStorage.getItem("jwt") || "";
  }

  function clearAuth(){
    ["token","authToken","ghostseller_token","jwt","user","profile","session","supabase.auth.token","sb-access-token","sb-refresh-token"].forEach(function(k){
      try{ localStorage.removeItem(k); }catch(e){}
      try{ sessionStorage.removeItem(k); }catch(e){}
    });
    try{
      Object.keys(localStorage).forEach(function(k){
        if(k.toLowerCase().includes("supabase") || k.toLowerCase().includes("auth")) localStorage.removeItem(k);
      });
      Object.keys(sessionStorage).forEach(function(k){
        if(k.toLowerCase().includes("supabase") || k.toLowerCase().includes("auth")) sessionStorage.removeItem(k);
      });
    }catch(e){}
  }

  function logout(){
    clearAuth();
    document.body.classList.remove("ghostseller-authenticated");
    window.location.href="/";
  }

  function isOwnerUser(){
    try{
      var raw=JSON.parse(localStorage.getItem("user")||sessionStorage.getItem("user")||"{}");
      var email=String(raw.email||raw.user?.email||"").toLowerCase();
      var role=String(raw.role||raw.user?.role||"").toLowerCase();
      return role==="owner" || role==="admin" || email.includes("muler");
    }catch(e){ return false; }
  }

  function install(){
    document.querySelectorAll("#ghostseller-bottom-actions,#owner-quick-access,#owner-quick-access-old").forEach(function(x){x.remove();});
    if(!getToken()) return;

    document.body.classList.add("ghostseller-authenticated");

    var top=document.getElementById("ghostseller-global-actions");
    if(!top){
      top=document.createElement("div");
      top.id="ghostseller-global-actions";

      var account=document.createElement("a");
      account.href="#";
      account.textContent="👤 Mon compte";
      account.onclick=function(e){
        e.preventDefault();
        if(window.v99Show) window.v99Show("account");
        else window.location.href="/";
      };
      top.appendChild(account);

      if(isOwnerUser()){
        var owner=document.createElement("a");
        owner.href="/owner";
        owner.className="owner-link";
        owner.textContent="👑 Owner";
        top.appendChild(owner);
      }

      var btn=document.createElement("button");
      btn.className="logout-btn";
      btn.textContent="Déconnexion";
      btn.onclick=logout;
      top.appendChild(btn);

      document.body.appendChild(top);
    }

    document.querySelectorAll("button,a").forEach(function(el){
      var text=(el.textContent||"").toLowerCase();
      var onclick=String(el.getAttribute("onclick")||"").toLowerCase();
      if(text.includes("déconnexion") || text.includes("deconnexion") || onclick.includes("logout")){
        el.onclick=function(e){e.preventDefault();logout();};
      }
    });
  }

  window.ghostSellerLogout=logout;
  window.v99Logout=logout;
  window.ownerLogout=logout;

  document.addEventListener("DOMContentLoaded",function(){
    setTimeout(install,300);
    setTimeout(install,1200);
    setTimeout(install,2500);
  });
  setTimeout(install,4000);
})();
