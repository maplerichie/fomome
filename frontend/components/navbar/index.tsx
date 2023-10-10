// "use client";

import { ConnectKitButton } from "connectkit";
import Link from "next/link";
import styles from "./Navbar.module.css";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { abi, contractAddress } from "@/helpers/web3";
import {
  getContract,
  prepareWriteContract,
  writeContract,
  waitForTransaction,
} from "wagmi/actions";
import Modal from "react-modal";
import moment from "moment-timezone";
import { utils } from "ethers";

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const [canStart, setCanStart] = useState(false);
  const FoMoMe = getContract({
    address: `0x${contractAddress.slice(2)}`,
    abi: abi,
  });
  const [hiwModal, setHIWModal] = useState(false);
  const [startModal, setStartModal] = useState(false);
  const [entryPrice, setEntryPrice] = useState(1);

  const checkMyGame = async () => {
    const game: any = await FoMoMe.read.getActiveGame([address]);
    if (game && game.status == 0) {
      setCanStart(true);
    }
  };

  const startGame = async (evt: any) => {
    evt.preventDefault();
    if (!isNaN(entryPrice) && entryPrice >= 0.01 && entryPrice <= 10) {
      // Limit the number of decimals to 2
      const roundedValue = parseFloat(entryPrice.toFixed(2));
      const bigIntValue = utils.parseUnits(`${roundedValue}`);
      const { request } = await prepareWriteContract({
        abi: abi,
        address: `0x${contractAddress.slice(2)}`,
        functionName: "start",
        value: bigIntValue as any,
        args: [bigIntValue],
      });
      const { hash } = await writeContract(request);
      // await waitForTransaction({ hash, confirmations: 5 });
      setStartModal(false);
      window.location.reload();
    } else {
      alert("Unknown error");
    }
  };

  useEffect(() => {
    if (address) {
      checkMyGame();
    }
  }, [isConnected]);

  Modal.setAppElement("#main");

  return (
    <nav className={styles.navbar}>
      <div className={styles.group}>
        <Link href="/">
          <p>FoMoME</p>
        </Link>
        <Link href="#" onClick={() => setHIWModal(true)}>
          <p>How It Works</p>
        </Link>
      </div>
      <div className={styles.group}>
        {canStart ? (
          <Link href="#" onClick={() => setStartModal(true)}>
            <p>Start a game</p>
          </Link>
        ) : (
          <></>
        )}
        <ConnectKitButton />
      </div>

      <Modal
        ariaHideApp={false}
        className={styles.modal}
        isOpen={hiwModal}
        onRequestClose={() => setHIWModal(false)}
      >
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>How FoMoMe Works</h2>
          <p className={styles.modalDescription}>
            Get ready to participate in the exciting game and win big!
          </p>
          <h4>1. Create or Join a Game</h4>
          <p>
            Users can create a new game by specifying the <b>entry fee</b>,
            which extends the game by <b>10 minutes</b>. The default duration
            per game is set to <b>60 minutes</b>.
          </p>
          <p>
            Each user can only start a game at a time until the game has ended
            and concluded.
          </p>
          <p>
            Other users can browse the list of active games and choose to join
            one that matches their preferences.
          </p>
          <h4>2. Fund the Game</h4>
          <p>
            The host must deposit the preset entry fee as the initial prize
            pool. This prize pool increases as more players join.
          </p>
          <p>
            Players who want to join a game must also deposit the required entry
            fee, which contributes to the prize pool.
          </p>
          <h4>3. Extend the Deadline</h4>
          <p>
            Every game starts with a duration of 60 minutes, but every time a
            player joins by paying the entry fee, the deadline for the game is
            extended. This extension is proportional to the entry fee paid,
            providing an incentive for more players to join.
          </p>
          <h4>4. Game Deadline</h4>
          <p>
            Once the game duration ends, the last player to join before the
            deadline expires wins the majority of the prize pool.
          </p>
          <h4>5. Conclude Winnings</h4>
          <p>
            After a game meets its deadline, anyone can conclude the game, and
            the prize will be distributed from the prize pool.
          </p>
          <ul>
            <li>Winner - 95%</li>
            <li>Executor - 3%</li>
            <li>Host - 1%</li>
            <li>FoMoMe - 1%</li>
          </ul>
          <br />
          <p>
            <i>
              Disclaimer: Participation in FoMoMe implies your acknowledgment
              and acceptance of the following terms: no responsibility is held
              by the contract creator, the contract is unaudited, and
              participants play at their own risk.
            </i>
          </p>
        </div>
        <button className={styles.button} onClick={() => setHIWModal(false)}>
          Close
        </button>
      </Modal>

      <Modal
        ariaHideApp={false}
        className={styles.modal}
        isOpen={startModal}
        onRequestClose={() => setStartModal(false)}
      >
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>FOMO and win big!</h2>
          <p className={styles.modalDescription}>New game</p>
          <form onSubmit={startGame}>
            <label>Entry Price</label>
            <input
              type="number"
              value={entryPrice}
              min={0.01}
              max={10}
              step={0.01}
              onChange={(e) => setEntryPrice(Number(e.target.value))}
              required
            />
            <small>
              <i>
                *Minimum 0.01 / Maximum 10 (ETH)
                <br />
                *Per 10 minutes extension
              </i>
            </small>
            <p>
              End at ~
              <i>{moment().add(1, "hour").format("yyyy/MM/DD hh:mm A")}</i>
            </p>
            <br />
            <div className={styles.buttonRow}>
              <button className={styles.button} type="submit">
                Start
              </button>
              <div className={styles.buttonSpace}></div>
              <button
                className={styles.button}
                onClick={() => setStartModal(false)}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </nav>
  );
}
