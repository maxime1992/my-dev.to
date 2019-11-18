export interface RotorConf {
  id: string;
  position: {
    z: number;
  };
}

export interface ConnectionsBetweenRotors {
  id: string;
  position: {
    z: number;
  };
}

export interface ThreeDimensionsEnvConf {
  rotors: RotorConf[];
  rotorMaterial: {
    alpha: number;
  };
}
