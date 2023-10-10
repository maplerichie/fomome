import { getContract } from "wagmi/actions";
import FoMoMeArtifact from "../artifacts/contracts/FoMoMe.sol/FoMoMe.json";
import Deployed from "../data/deployed.json";

export const contractAddress = Deployed.FoMoMe;
export const abi = FoMoMeArtifact.abi;
