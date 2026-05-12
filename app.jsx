// App — wires the 3 directions into a DesignCanvas with 3 sections × 3 artboards.

const { DesignCanvas, DCSection, DCArtboard, DCPostIt } = window;

function App() {
  return (
    <DesignCanvas>
      <DCSection id="brief" title="Refonte BACTERIOMAP" subtitle="3 directions de design hi-fi · accueil, vue zone, fiche bactérie">
        <DCPostIt width={320}>
          <strong>Contexte</strong><br/>
          Outil pédagogique microbiologie · CHUV Lausanne · TAB en formation. Vanilla HTML/CSS/JS, offline, Edge.<br/><br/>
          <strong>Les 3 directions</strong><br/>
          <strong>1 · Clinique</strong> — Swiss medical, monochrome graphite + rouge signal. Silhouette anatomique + index numéroté.<br/>
          <strong>2 · Éditorial</strong> — Atlas scientifique. Sérif Newsreader, beige papier, table des matières en chapitres romains.<br/>
          <strong>3 · Cartographique</strong> — BACTERIOMAP littéral. Carte topographique du corps, isolignes, légende latérale, coordonnées.<br/><br/>
          Chaque direction couvre les 3 écrans demandés (accueil, vue zone+sous-zones, fiche). Cliquer sur un artboard pour le voir en plein écran.
        </DCPostIt>
      </DCSection>

      {/* DIRECTION 1 */}
      <DCSection id="clinique" title="01 · Clinique / Instrument" subtitle="Swiss medical · monochrome + rouge signal · silhouette anatomique + index numéroté">
        <DCArtboard id="cli-home"  label="A · Accueil — silhouette + index"          width={1280} height={900}><CliniqueHome/></DCArtboard>
        <DCArtboard id="cli-zone"  label="B · ORL — sous-zones en onglets"            width={1280} height={950}><CliniqueZone/></DCArtboard>
        <DCArtboard id="cli-sheet" label="C · Fiche — instrument readout + sections" width={1280} height={1400}><CliniqueSheet/></DCArtboard>
      </DCSection>

      {/* DIRECTION 2 */}
      <DCSection id="editorial" title="02 · Éditorial / Atlas scientifique" subtitle="Manuel scientifique · Newsreader sérif · beige papier · table des matières">
        <DCArtboard id="edi-home"  label="A · Accueil — table des matières"            width={1280} height={900}><EditorialHome/></DCArtboard>
        <DCArtboard id="edi-zone"  label="B · Chapitre III — planche & sous-zones"     width={1280} height={1000}><EditorialZone/></DCArtboard>
        <DCArtboard id="edi-sheet" label="C · Entrée d'atlas — marginalia"             width={1280} height={1400}><EditorialSheet/></DCArtboard>
      </DCSection>

      {/* DIRECTION 3 */}
      <DCSection id="carto" title="03 · Cartographique / Topographie" subtitle="BACTERIOMAP littéral · carte topographique · isolignes · coordonnées">
        <DCArtboard id="car-home"  label="A · Feuille générale — carte du corps"      width={1280} height={950}><CartoHome/></DCArtboard>
        <DCArtboard id="car-zone"  label="B · Feuille 03 ORL — sous-zones villages"   width={1280} height={950}><CartoZone/></DCArtboard>
        <DCArtboard id="car-sheet" label="C · Dossier d'espèce — carte distribution"  width={1280} height={1100}><CartoSheet/></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
