/*
//example mols and mass ~ hz..

const agua = "H2O";
const dioxidoDeCarbono = "CO2";

console.log(agua); // H2O
console.log(dioxidoDeCarbono); // CO2

const moleculas = {
  H2O: { H: 2, O: 1 },
  CO2: { C: 1, O: 2 }
};

console.log(moleculas.H2O); // { H: 2, O: 1 }
console.log(moleculas.CO2); // { C: 1, O: 2 }


*/

const massaAtomica = { H: 1.008, C: 12.011, O: 15.999 };

function massaMolar(molecula) {
  let massa = 0;
  for (const [elemento, quantidade] of Object.entries(molecula)) {
    massa += massaAtomica[elemento] * quantidade;
  }
  return massa;
}

const moleculas = {
  H2O: { H: 2, O: 1 },
  CO2: { C: 1, O: 2 }
};

console.log("Massa molar H2O:", massaMolar(moleculas.H2O)); // ≈ 18.015
console.log("Massa molar CO2:", massaMolar(moleculas.CO2)); // ≈ 44.009
