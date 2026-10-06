const selected={
  massa:{value:"Tradicional",price:8},
  recheio:{value:"Sem recheio",price:0},
  extra:{value:"Sem extra",price:0}
};

const cart=[];
let customId=1;

const money=v=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const customTotal=()=>Object.values(selected).reduce((s,i)=>s+i.price,0);

function getCustomTitle(){
  let title = selected.massa.value;
  if(selected.recheio.value !== "Sem recheio"){
    title += " com " + selected.recheio.value;
  }
  if(selected.extra.value !== "Sem extra"){
    title += " + " + selected.extra.value;
  }
  return title;
}

function clearLayer(layer){
  layer.className = layer.className
    .split(" ")
    .filter(name => !name.startsWith("layer-") && name !== "show")
    .join(" ");
}

function setLayer(layer, type){
  clearLayer(layer);
  if(!type) return;
  layer.classList.add("show", "layer-" + type);
}

function updateBrowniePreview(){
  const preview=document.querySelector("#browniePreview");
  const fillingA=document.querySelector("#fillingA");
  const fillingB=document.querySelector("#fillingB");
  const extraLayer=document.querySelector("#extraLayer");

  preview.classList.toggle("is-brokie", selected.massa.value === "Brokie");
  preview.classList.toggle("has-strawberry", selected.extra.value === "Morango");

  setLayer(fillingA, null);
  setLayer(fillingB, null);
  setLayer(extraLayer, null);

  const recheio = selected.recheio.value;

  if(recheio === "Ninho"){
    setLayer(fillingA,"ninho");
  }
  if(recheio === "Ninho com Nutella"){
    setLayer(fillingA,"ninho");
    setLayer(fillingB,"nutella");
  }
  if(recheio === "Brigadeiro"){
    setLayer(fillingA,"brigadeiro");
  }
  if(recheio === "Ninho com brigadeiro"){
    setLayer(fillingA,"ninho");
    setLayer(fillingB,"brigadeiro");
  }

  const extra = selected.extra.value;
  if(extra === "Ninho") setLayer(extraLayer,"ninho");
  if(extra === "Brigadeiro") setLayer(extraLayer,"brigadeiro");
  if(extra === "Nutella") setLayer(extraLayer,"nutella");
  if(extra === "Morango") setLayer(extraLayer,"morango");

  preview.classList.remove("preview-pop");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      preview.classList.add("preview-pop");
    });
  });
}

function updateSummary(){
  document.querySelector("#summaryTitle").textContent=getCustomTitle();
  document.querySelector("#sMassa").textContent=selected.massa.value;
  document.querySelector("#sRecheio").textContent=selected.recheio.value;
  document.querySelector("#sExtra").textContent=selected.extra.value;
  document.querySelector("#summaryPrice").textContent=money(customTotal());
  updateBrowniePreview();
}

document.querySelectorAll(".group").forEach(group=>{
  const key=group.dataset.group;
  group.querySelectorAll(".choice").forEach(btn=>{
    btn.addEventListener("click",()=>{
      group.querySelectorAll(".choice").forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");
      selected[key]={value:btn.dataset.value,price:Number(btn.dataset.price)};
      updateSummary();
    });
  });
});

function toast(text){
  const el=document.querySelector("#toast");
  document.querySelector("#toastText").textContent=text;
  el.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer=setTimeout(()=>el.classList.remove("show"),1800);
}

function addReady(name,price){
  const existing=cart.find(x=>x.type==="ready"&&x.name===name);
  if(existing) existing.qty++;
  else cart.push({id:"r-"+name,type:"ready",name,details:"Sabor pronto",price,qty:1});
  renderCart();
  toast(name+" adicionado.");
}

document.querySelectorAll(".add-ready").forEach(btn=>{
  btn.addEventListener("click",()=>addReady(btn.dataset.name,Number(btn.dataset.price)));
});

document.querySelector("#addCustom").addEventListener("click",()=>{
  cart.push({
    id:"c-"+customId++,
    type:"custom",
    name:getCustomTitle(),
    details:`Massa: ${selected.massa.value} • Recheio: ${selected.recheio.value} • Extra: ${selected.extra.value}`,
    price:customTotal(),
    qty:1
  });
  renderCart();
  toast("Brownie montado adicionado.");
});

function renderCart(){
  const box=document.querySelector("#cartItems");
  const count=cart.reduce((s,x)=>s+x.qty,0);
  const total=cart.reduce((s,x)=>s+x.price*x.qty,0);

  document.querySelector("#cartBadge").textContent=count;
  document.querySelector("#cartTotal").textContent=money(total);

  if(!cart.length){
    box.innerHTML=`<div class="empty"><span>🍫</span><h3>Sua caixa está vazia.</h3><p>Adicione um sabor pronto ou monte seu brownie.</p></div>`;
    return;
  }

  box.innerHTML=cart.map(item=>`
    <article class="cart-item">
      <div class="item-top">
        <div><h3>${item.name}</h3><p>${item.details}</p></div>
        <strong>${money(item.price)}</strong>
      </div>
      <div class="item-bottom">
        <div class="qty">
          <button data-action="minus" data-id="${item.id}">−</button>
          <span>${item.qty}</span>
          <button data-action="plus" data-id="${item.id}">+</button>
        </div>
        <button class="remove" data-action="remove" data-id="${item.id}">Remover</button>
      </div>
    </article>`).join("");

  box.querySelectorAll("[data-action]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const item=cart.find(x=>x.id===btn.dataset.id);
      if(!item)return;
      if(btn.dataset.action==="plus")item.qty++;
      if(btn.dataset.action==="minus")item.qty--;
      if(btn.dataset.action==="remove"||item.qty<=0)cart.splice(cart.indexOf(item),1);
      renderCart();
    });
  });
}

const openCart=()=>{document.body.classList.add("cart-open","lock")};
const closeCart=()=>{document.body.classList.remove("cart-open","lock")};

document.querySelector("#openCart").addEventListener("click",openCart);
document.querySelector("#closeCart").addEventListener("click",closeCart);
document.querySelector("#overlay").addEventListener("click",closeCart);

document.querySelector("#clearCart").addEventListener("click",()=>{
  cart.length=0;
  renderCart();
});

document.querySelector("#checkout").addEventListener("click",()=>{
  if(!cart.length){toast("Sua caixa está vazia.");return}
  const count=cart.reduce((s,x)=>s+x.qty,0);
  const total=cart.reduce((s,x)=>s+x.price*x.qty,0);
  document.querySelector("#modalText").textContent=`Sua caixa tem ${count} brownie(s), no total de ${money(total)}.`;
  closeCart();
  document.querySelector("#modal").classList.add("show");
  document.body.classList.add("lock");
});

function closeModal(){
  document.querySelector("#modal").classList.remove("show");
  document.body.classList.remove("lock");
}
document.querySelector("#closeModal").addEventListener("click",closeModal);
document.querySelector("#continueBtn").addEventListener("click",closeModal);

document.querySelector("#menuBtn").addEventListener("click",()=>{
  document.querySelector("#nav").classList.toggle("open");
});
document.querySelectorAll("#nav a").forEach(a=>a.addEventListener("click",()=>document.querySelector("#nav").classList.remove("open")));

updateSummary();
renderCart();
