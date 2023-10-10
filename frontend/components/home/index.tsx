import styles from "./home.module.css";
import { useState, useEffect } from "react";
import { contractAddress, abi } from "@/helpers/web3";
import { utils } from "ethers";
import moment from "moment-timezone";
import Modal from "react-modal";
import {
  getContract,
  prepareWriteContract,
  writeContract,
  waitForTransaction,
} from "wagmi/actions";
import { useAccount } from "wagmi";

export default function Home() {
  const [activeHosts, setActiveHosts] = useState<any>([]);
  const [activeGames, setActiveGames] = useState<any>([]);
  const { isConnected } = useAccount();
  const FoMoMe = getContract({
    address: `0x${contractAddress.slice(2)}`,
    abi: abi,
  });

  const getActiveHosts = async () => {
    const res: any = await FoMoMe.read.getActiveHosts();
    if (res) {
      setActiveHosts(res);
      let games = [];
      for (let host of res) {
        const game: any = await FoMoMe.read.getActiveGame([host]);
        games.push({ host, ...game });
      }
      setActiveGames(games);
    }
  };

  useEffect(() => {
    getActiveHosts();
  }, []);

  return (
    <div className={styles.container}>
      <h3>Join any of these games 💰</h3>
      <br />
      <div className={styles.cards_container}>
        {activeGames &&
          activeGames.map((game: any, index: number) => (
            <GameCard
              key={index}
              game={game}
              index={index}
              isConnected={isConnected}
            />
          ))}
      </div>
    </div>
  );
}

Modal.setAppElement("#main");

function GameCard({
  game,
  index,
  isConnected,
}: {
  game: any;
  index: number;
  isConnected: boolean;
}) {
  const deadline = moment.unix(Number(game.deadline)); //.tz("UTC");
  const expired = moment().utc() > deadline;
  const price = parseFloat(utils.formatUnits(game.price, 18));
  const [extValue, setExtensionTime] = useState(1);

  const [gameModal, setGameModal] = useState(false);

  const endGame = async (evt: any) => {
    evt.preventDefault();
    if (!isConnected) return alert("Connect wallet!");
    const { request } = await prepareWriteContract({
      abi: abi,
      address: `0x${contractAddress.slice(2)}`,
      functionName: "conclude",
      args: [game.host],
    });
    const { hash } = await writeContract(request);
    // await waitForTransaction({ hash, confirmations: 5 });
    window.location.reload();
  };

  const openJoinModal = (evt: any) => {
    evt.preventDefault();
    setExtensionTime(1);
    setGameModal(true);
  };

  const joinGame = async (evt: any) => {
    evt.preventDefault();
    if (!isConnected) return alert("Connect wallet!");
    const { request } = await prepareWriteContract({
      abi: abi,
      address: `0x${contractAddress.slice(2)}`,
      functionName: "join",
      value: utils.parseUnits(
        (parseInt(`${extValue}`) * price).toString(),
        18
      ) as any,
      args: [game.host],
    });
    const { hash } = await writeContract(request);
    // const data = await waitForTransaction({ hash, confirmations: 5 });
    setGameModal(false);
    window.location.reload();
  };

  return (
    <div key={index} className={styles.card}>
      <h2>
        <i>#{index + 1}</i>
      </h2>
      <p>
        Host by <i>{game.host}</i>
      </p>
      <p>
        Entry fee <i>{utils.formatUnits(game.price, 18)} ETH</i>
      </p>
      <p>
        Prize pool <i>{utils.formatUnits(game.prize, 18)} ETH</i>
      </p>
      <br />
      {expired ? <></> : <p>End {deadline.fromNow()}</p>}
      <p>
        {expired ? "Winner" : "Last joined"}: <i>{game.lastParticipant}</i>
      </p>
      <button
        className={styles.button}
        onClick={expired ? endGame : openJoinModal}
      >
        {expired ? "Execute" : "Join"}
      </button>
      <Modal
        className={styles.modal}
        isOpen={gameModal}
        onRequestClose={() => setGameModal(false)}
      >
        <div>
          <h2>Join Game</h2>
          <p>
            Host by <i>{game.host}</i>
          </p>
          <p>
            Prize pool{" "}
            <i>
              {utils.formatUnits(game.prize, 18)} +{" "}
              {parseInt(`${extValue}`) * price} ETH
            </i>
          </p>
          <p>Last joined {game.lastParticipant}</p>

          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={extValue}
            onChange={(e) => setExtensionTime(parseFloat(e.target.value))}
          />
          <p>Pay {parseInt(`${extValue}`) * price} ETH</p>
          <p>End at {deadline.format("yyyy/MM/DD hh:mm A")}</p>
          <p>
            Extend to{" "}
            {deadline
              .add(parseInt(`${extValue}`) * 10, "minute")
              .format("yyyy/MM/DD hh:mm A")}
            {" (+"}
            {parseInt(`${extValue}`) * 10} Minutes{")"}
          </p>

          <button className={styles.button} onClick={joinGame}>
            Join
          </button>
        </div>
      </Modal>
    </div>
  );
}
