type Status = "ok" | "alerta" | "erro";

export function calcularStatus(temp: number, vib: number): Status {

  if (temp > 80 || vib > 7.1) {
    return "erro";
  }

  if (temp > 60 || vib > 2.8) {
    return "alerta";
  }

  return "ok";
}