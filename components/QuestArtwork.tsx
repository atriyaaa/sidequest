type Props = {
  questId: string;
};

export default function QuestArtwork({ questId }: Props) {
  let artwork;

  switch (questId) {
    case "scenic-route":
      artwork = (
        <>
          <circle cx="245" cy="48" r="25" fill="#E84797" />

          <path
            d="M0 150 Q85 60 180 135 T360 110 V220 H0Z"
            fill="#4E7CB2"
          />

          <path
            d="M0 190 Q100 100 220 165 T360 150 V220 H0Z"
            fill="#203F9A"
          />

          <path
            d="M175 220 Q260 178 210 155 Q180 140 220 126"
            fill="none"
            stroke="#EFE8E0"
            strokeWidth="15"
          />

          <path
            d="M73 160V90 M53 120L73 91L94 120
               M57 137L73 112L90 137"
            fill="none"
            stroke="#203F9A"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
      break;

    case "table-for-one":
      artwork = (
        <>
          <ellipse
            cx="180"
            cy="174"
            rx="87"
            ry="13"
            fill="#E7A0CC"
          />

          <path
            d="M122 85H222V130Q222 169 172 169
               Q122 169 122 130Z"
            fill="#FFFDFA"
            stroke="#203F9A"
            strokeWidth="4"
          />

          <path
            d="M223 98Q268 94 255 127Q247 144 223 140"
            fill="none"
            stroke="#203F9A"
            strokeWidth="5"
          />

          <ellipse
            cx="172"
            cy="85"
            rx="50"
            ry="11"
            fill="#203F9A"
          />

          <path
            d="M156 59Q143 44 156 29
               M183 59Q170 44 183 29"
            fill="none"
            stroke="#203F9A"
            strokeWidth="4"
            strokeLinecap="round"
          />

          <path
            d="M286 48V68 M276 58H296"
            stroke="#E84797"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      );
      break;

    case "collect-a-colour":
      artwork = (
        <>
          <g transform="rotate(-10 180 110)">
            <rect
              x="94"
              y="40"
              width="116"
              height="143"
              rx="5"
              fill="#FFFDFA"
              stroke="#203F9A"
              strokeWidth="3"
            />
            <rect
              x="107"
              y="54"
              width="90"
              height="92"
              fill="#94C2DA"
            />
            <circle cx="152" cy="100" r="25" fill="#203F9A" />
            <path
              d="M123 162H178"
              stroke="#203F9A"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>

          <g transform="rotate(13 230 120)">
            <rect
              x="185"
              y="67"
              width="80"
              height="108"
              rx="5"
              fill="#EFE8E0"
              stroke="#203F9A"
              strokeWidth="3"
            />
            <rect
              x="195"
              y="78"
              width="60"
              height="67"
              fill="#E84797"
            />
          </g>
        </>
      );
      break;

    case "little-sunshine":
      artwork = (
        <>
          <g transform="rotate(-8 180 115)">
            <rect
              x="87"
              y="62"
              width="186"
              height="119"
              rx="9"
              fill="#FFFDFA"
              stroke="#203F9A"
              strokeWidth="4"
            />

            <path
              d="M90 66L180 133L270 66
                 M90 178L149 126
                 M270 178L211 126"
              fill="none"
              stroke="#203F9A"
              strokeWidth="3"
            />

            <path
              d="M180 105
                 C153 79 139 113 180 140
                 C221 113 207 79 180 105Z"
              fill="#E84797"
            />
          </g>
        </>
      );
      break;

    case "green-escape":
      artwork = (
        <>
          <path
            d="M140 144H221L210 195H151Z"
            fill="#E7A0CC"
            stroke="#203F9A"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          <path
            d="M180 144V51"
            stroke="#203F9A"
            strokeWidth="5"
            strokeLinecap="round"
          />

          <path
            d="M178 117Q115 117 121 72Q170 70 178 117Z"
            fill="#4E7CB2"
            stroke="#203F9A"
            strokeWidth="3"
          />

          <path
            d="M182 95Q237 94 241 48Q192 49 182 95Z"
            fill="#203F9A"
          />

          <path
            d="M178 73Q143 68 151 33Q181 38 178 73Z"
            fill="#E84797"
          />
        </>
      );
      break;

    default:
      artwork = (
        <>
          <circle cx="180" cy="96" r="44" fill="#E84797" />

          <g
            stroke="#E84797"
            strokeWidth="4"
            strokeLinecap="round"
          >
            <path d="M180 28V15 M180 177V164" />
            <path d="M112 96H99 M261 96H248" />
            <path d="M132 48L123 39 M237 153L228 144" />
            <path d="M228 48L237 39 M123 153L132 144" />
          </g>

          <path
            d="M0 165Q90 125 180 165T360 165V220H0Z"
            fill="#4E7CB2"
          />

          <path
            d="M0 194Q100 157 210 191T360 185V220H0Z"
            fill="#203F9A"
          />
        </>
      );
  }

  return (
    <svg
      className="quest-illustration"
      viewBox="0 0 360 220"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {artwork}
    </svg>
  );
}