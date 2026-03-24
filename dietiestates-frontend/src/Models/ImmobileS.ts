import { Immobile} from "./Immobili";

export interface ImmobileS extends Immobile{

    id: number;
    scuoleVicine : boolean
    parchiVicini : boolean
    trasportiPubbliciVicini: boolean

}