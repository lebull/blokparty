import { createContext } from "react";
import { MusicAnalyzer } from "../util/musicAnalyzer";


const MusicAnalyzerContext = createContext(new MusicAnalyzer());

export default MusicAnalyzerContext;
