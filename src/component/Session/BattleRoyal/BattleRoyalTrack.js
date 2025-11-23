import 'react';

function BattleRoyalTrack({track}) {

    const players = track.players.filter(p=>p.enabled).sort((a, b) => b.score - a.score);

    return <div
        style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            flexDirection: 'column',
        }}
    >
        {players.map((player)=><div
            key={player.id}
            style={{
                color: 'white',
                fontSize: '5rem',
                fontWeight: 'bold',
            }}
        >
            {player.name} : {player.score}
        </div>)}
    </div>
}

export default BattleRoyalTrack;