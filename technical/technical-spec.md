Perfecto. Abajo te dejo el proyecto completo (Game Design + economía + arquitectura web3 + reglas + fórmulas + catálogos iniciales) con las nuevas actualizaciones de outfit y todo lo anterior integrado, ya coherente y listo para implementar.

0) Visión del juego (resumen)

Juego de lucha técnico donde el progreso es del jugador (XP/Level hasta 1000).
El jugador puede usar máscaras NFT (Common/Rare/Legendary) y un loadout compuesto por:

Parches de máscara (tradeables, bloqueados al equipar)

Trait / Moves / Power (Power solo en Legendary y solo desde nivel 50)

Outfit por partes (tradeables, bloqueados al equipar)

Boots (pies), Tights (piernas), Shirt (torso), Cape (espalda)

El objetivo es que el skill y la toma de decisiones manden: kits, recursos (stamina), frame data, y ventajas numéricas pequeñas con caps estrictos.

1) Reglas finales (cerradas)
1.1 Máscaras y slots de parche (por rareza)

Common: 1 slot → Trait

Rare: 2 slots → Trait + Moves

Legendary: 3 slots → Trait + Moves + Power
✅ Power solo existe en Legendary

1.2 Reglas de nivel (importantes)

Common Trait slot: solo usable desde nivel ≥ 8

Power (Legendary): solo usable desde nivel ≥ 50

Rare/Legendary (Trait y Moves): desde nivel 1

1.3 Tier-lock de parches (obligatorio)

Parche Common ↔ máscara Common

Parche Rare ↔ máscara Rare

Parche Legendary ↔ máscara Legendary

1.4 Outfit slots (siempre 4)

Boots (pies)

Tights (piernas)

Shirt (torso)

Cape (espalda)

Reglas:

1 item por slot

Tradeable, pero bloqueado mientras esté equipado (escrow/lock)

Efectos técnicos y situacionales (no “daño bruto” masivo)

1.5 Anti-exploit (crítico)

Todo lo que otorgue atributos (parches y outfits) se equipa mediante escrow:

Equipar = transferir ERC-1155 al contrato del juego (bloqueado)

Desequipar = devolver al jugador

Esto evita: “equipar → jugar → vender” manteniendo buffs.

2) Stats y filosofía técnica (para que no sea P2W)
2.1 Stats primarios (solo 4)

STR (daño base)

SPD (movimiento; cappeado fuerte)

DEF (mitigación efectiva)

STA (barra + regeneración + costos)

2.2 Lo que NO deben modificar los ítems (para no romper meta)

Startup/recovery global de todos los ataques

Hitstun/blockstun global

I-frames “gratis”

Daño plano alto global

2.3 Caps globales (sumando TODO: nivel + parches + outfit)

Estos caps mantienen competitivo el juego incluso con nivel 1000:

Daño total (STR efectivo): máx +18%

Mitigación efectiva (DEF): máx +15%

Eficiencia de STA (costos/regen): máx ±15%

Movilidad suelo (walk/dash): máx +10%

Movilidad aérea (air control/air dash): máx +12%

Cambios de frames: como regla, 0. Excepción: dash recovery -1 frame máximo en items específicos y raros.

3) Progresión: Nivel 1–1000
3.1 XP para subir de nivel
𝑋
𝑃
_
𝑛
𝑒
𝑥
𝑡
(
𝐿
)
=
80
+
4
𝐿
+
0.06
𝐿
2
XP_next(L)=80+4L+0.06L
2

Hitos útiles:

Nivel 8 (Common Trait habilitado): ~680 XP

Nivel 50 (Power habilitado): ~11,245 XP

Nivel 1000 total: ~22,047,930 XP

3.2 XP por pelea (pacing recomendado)
𝑋
𝑃
_
𝑚
𝑎
𝑡
𝑐
ℎ
(
𝐿
)
=
40
+
6
𝐿
+
𝑏
𝑜
𝑛
𝑢
𝑠
XP_match(L)=40+6
L
	​

+bonus
4) Loadout final del jugador (lo que “define” el build)
4.1 Componentes del loadout

Mask NFT equipada (1)

Parches (0–3 según máscara y nivel):

TraitPatchId

MovesPatchId

PowerPatchId (solo Legendary y lvl≥50)

Outfit (4):

BootsId, TightsId, ShirtId, CapeId

4.2 Hash del loadout (para resultados firmados del combate)

Para que nadie reclame con build distinto:

loadoutHash = hash(
  profileId, maskTokenId,
  traitPatchId, movesPatchId, powerPatchId,
  bootsId, tightsId, shirtId, capeId
)


Cualquier slot no aplicable = 0.

5) Arquitectura Web3 (contratos) — lista para construir
5.1 Contratos

MaskNFT (ERC-721)

guarda maskTier por token (Common/Rare/Legendary)

PatchToken (ERC-1155)

metadata on-chain por patchId:

tier, slotType (Trait/Moves/Power), effects

OutfitToken (ERC-1155)

metadata on-chain por itemId:

slotType (Boots/Legs/Torso/Back), effects, flags (p.ej. “glide”, “airDash”)

PlayerProfile (opcional)

puede ser storage por wallet o NFT soulbound

guarda XP, nivel, etc.

GameCore (el importante)

guarda equipamiento y hace escrow/lock

valida reglas de tier, nivel, slots

procesa claims de resultados firmados (EIP-712)

5.2 Estado mínimo en GameCore

equippedMask[profileId] = maskTokenId

equippedPatch[profileId][slot] = patchId

equippedOutfit[profileId][outfitSlot] = itemId

isEquippedPatch[profileId][patchId] = bool (para “no repetir parche”)

xp[profileId], level[profileId]

claimedMatch[matchId] = true

authorizedSigner (servidor de juego)

5.3 Funciones clave

equipMask(profileId, maskTokenId)

valida ownership

set máscara

auto-unequip de parches inválidos (tier/slot/nivel)

equipPatch(profileId, patchId)

valida: tier == maskTier

valida slot permitido por máscara

valida nivel: common≥8, power≥50

slot vacío y patchId no repetido

escrow: transfiere 1 unidad al contrato

unequipPatch(profileId, slot)

equipOutfit(profileId, outfitSlot, itemId)

valida slot

slot vacío

escrow

unequipOutfit(profileId, outfitSlot)

claimMatchResult(matchId, profileId, xpGained, loadoutHash, signature)

verifica firma EIP-712

verifica matchId no usado

verifica loadoutHash actual

suma XP, recalcula nivel

6) Backend / combate off-chain (recomendado)

Como es juego de lucha técnico (real-time), el combate se simula off-chain. Al final:

El servidor firma:

matchId (único)

profileId

xpGained

loadoutHash

(opcional) stats del match para ranking

El contrato solo verifica y actualiza progreso.

7) Catálogo inicial de PARCHES (máscara)

Mantengo el enfoque: Trait = stats + tradeoff, Moves = kit, Power = táctico.

7.1 Common Trait (10)

Ligero: +5% SPD, -2% DEF

Bruto: +5% STR, -2% SPD

Muralla: +6% DEF, -2% SPD

Cardio: +6% STA, -2% STR

Reacción: +4% SPD, +2% DEF, -2% STR

Impacto: +4% STR, +2% STA, -2% SPD

Templado: -4% daño de combos recibidos, -2% SPD

Recuperación: +8% regen STA fuera presión, -2% DEF

Centro: +3% DEF y reduce knockback, -2% SPD

Agarre: +4% STR en throws, -2% STA

✅ Usable solo si máscara Common y nivel ≥ 8.

7.2 Rare Trait (10)

Atleta: +8% SPD, -4% DEF

Demoledor: +8% STR, -4% SPD

Armadura: +9% DEF, -5% SPD

Pulmón: +9% STA, -4% STR

Precisión: +6% daño a counters, -3% STA

Contraataque: +7% daño tras bloquear, -4% SPD

Pie firme: +7% DEF vs throws, -3% STR

Explosivo: +7% STR primeros 10s, -4% STA

Evasivo: +7% ventana dodge, -4% DEF

Disciplina: -6% costo STA en Moves, -3% STR

7.3 Rare Moves (10) – kit técnico

Cobra string (3-hit rápido, nuevas rutas)

Uppercut cancelable (juggle corto, punishable)

Low sweep (derribo al final)

Guard breaker (carga 1s, abre defensa)

Throw extension (follow-up si falla tech)

Backstep strike (whiff punish tool)

Parry move (ventana estricta, castiga)

Air starter (rutas aéreas)

Wall bounce (situacional en borde)

Finisher lariat (alto riesgo/alto reward)

7.4 Legendary Trait (10)

Furia: +12% STR, -7% DEF

Sombra: +12% SPD, -7% STR

Bastión: +12% DEF, -8% SPD

Motor: +12% STA, -7% STR

Técnico: +10% daño a counters, -6% STA

Gladiador: +10% STR +4% DEF, -8% SPD

Duelista: +10% SPD +4% STR, -8% DEF

Hierro: reduce stagger, -6% SPD

Maestría: -10% costo STA Moves, -6% STR

Instinto: +8% dodge/parry window, -6% DEF

7.5 Legendary Moves (10)

Jaguar routes (mixups)

Heavy launcher (castigable)

Feint system (costo STA)

Command grab (tool)

Armor move (1-hit armor, caro)

Wake-up reversal (baitable)

Teleport step (movilidad, caro)

Corner trap string

Air finisher

Stance change (dos sets)

7.6 Legendary Powers (10) — nivel ≥ 50

Todos con: costo 30 STA, CD 45–60s, counterplay claro.

Fuego: DOT 6s (counter: cleanse/spacing)

Aire: 1 air-dash extra 5s (counter: anti-air reads)

Tierra: shield 30% 4s (counter: throws/guard break)

Agua: heal 8% 4s (counter: presión)

Rayo: micro-stun solo on-confirm (counter: no regalar confirm)

Sombra: ocultar intención 3s (counter: zoners/keepout)

Magia: seal power enemigo 6s (counter: bait)

Luz: cleanse debuffs (counter: forzar uso temprano)

Hielo: slow 10% 5s (counter: movilidad/cleanse)

Sangre: berserk +12% STR y -10% DEF 6s (alto riesgo)

8) Catálogo inicial completo de OUTFIT (80 ítems)

Formato: Nombre — Efecto | Tradeoff/Costos
(Todos tradeables, equipar = lock. Nada da daño global grande. SPD/Movilidad siempre dentro de caps.)

8.1 Boots (20) — suelo/footsies

Sprinter Boots — +6% walk/dash | -3% DEF

Anchor Boots — -2% movilidad, +6% anti-pushback | -2% regen STA

Feint Boots — feint -10% STA | -2% STR

Pivot Boots — mejor pivot/turn speed +8% | -2% DEF

Dash Saver — dash cuesta -1 STA | -3% STR

Whiff Hunter — +4% velocidad al backstep | -2% STA

Grease Soles — +6% dash distance | +6% costo STA en dash

Iron Heel — reduce knockback | -3% SPD

Slip Counter — tras perfect block: +3 STA | -2% DEF

Sprint Burst — 2s +8% movilidad (CD 12s) | cuesta 8 STA

Low Profile — hurtbox baja al caminar | -2% STR

Step Cancel — micro-step cancel (coste 6 STA) | -2% DEF

Stamina Tread — +6% regen STA fuera presión | -2% SPD

Guard Step — block-walk más rápido +6% | -2% STR

Precision Foot — ventana de input +3% (ejecución) | -2% DEF

Heavy Grip — mejor tech contra pushes | -2% movilidad

Corner Escape — backdash pushback +6% | -2% STA

Tempo Boots — al acertar jab: -1 STA en dash (5s) | -2% DEF

Anti-Trip — reduce daño de sweeps | -2% SPD

Duel Boots — +3% SPD y +2% DEF | -2% STA

8.2 Tights (20) — salto/aire/control

High Jump — +10% altura | -4% DEF

Air Control — +12% control aéreo | -3% STR

Short-Hop Master — short-hop consistente | -2% movilidad suelo

Landing Soft — -10% recovery al aterrizar (máx -1 frame equivalente) | -2% STR

Anti-Air Guard — -8% daño recibido en aire | -2% SPD suelo

Second Step — 1 double-jump corto (costo 18 STA) | -3% DEF

Fast Fall — fast-fall control +10% | -2% DEF

Hover Lite — micro-hover 0.8s (costo 12 STA, CD 10s) | -2% STR

Knee Drive — mejor alcance en saltos | -2% STA

Air Brake — freno aéreo (costo 8 STA) | -2% DEF

Wall Kick — 1 wall-jump (costo 15 STA) | -3% STR

Jump Economy — saltos cuestan -10% STA | -2% DEF

Air Tech — tech aéreo más fácil | -2% STR

Sky Angles — ángulo de salto ajustable | -2% SPD suelo

Dive Prep — habilita divekick light (castigable) | -3% DEF

Float Control — air time +8% | -2% STR

Anti-Gravity — +6% altura +6% control | -4% DEF

Burst Leap — salto con impulso (CD 12s, 10 STA) | -2% DEF

Air Parry Assist — ventana parry aéreo +3% | -2% STA

Acrobat — +4% movilidad aire y +4% movilidad suelo | -4% DEF

8.3 Shirts (20) — defensa/recursos/guard

Guard Shirt — -10% chip | -3% movilidad

Stagger Shirt — reduce stagger | -6% regen STA

Pressure Shirt — bloqueo -8% STA | +3% daño recibido en throws

Recovery Shirt — +10% regen STA fuera presión | -3% DEF

Fortified Tee — +6% DEF | -3% SPD

Anti-Burst — reduce daño de strings largos | -2% STR

Grapple Padding — -10% daño de agarres | -2% STR

Stoic — reduce pushback al bloquear | -2% SPD

Guard Break Resist — guard meter +8% (si lo usas) | -2% STR

Calm Breath — al estar idle 2s: +6 STA | -2% DEF

Chip Convert — parte del chip se convierte en STA (-30%) | -3% STR

Pain Tolerance — -6% daño recibido | +4% costo STA en cancels

Anti-Air Plate — -8% daño de ataques aéreos | -2% SPD

Frame Stable — reduce penalización por whiff | -2% STR

Cleanse Cloth — reduce duración de debuffs 20% | -2% DEF

Heavy Weave — +8% DEF | -5% SPD

Counter Guard — tras bloqueo perfecto: +2% daño next hit (5s) | -2% STA

Stamina Shield — -10% costo STA en block | -3% SPD

Tempo Armor — 1 “soft armor” vs jab (CD 20s) | -3% STR

Duel Shirt — +3% DEF +3% STA | -3% SPD

8.4 Capes (20) — herramientas aéreas (técnico)

Nota: Hover/Flight real exige nivel ≥ 50 (igual que Power) y siempre cuesta STA + CD.

Glide Cape — glide 2s (12 STA, CD 10s) | no puedes atacar gliding

Air Dash Cape — +1 air dash (15 STA, CD 10s) | -2% DEF

Hover Cape — hover 3s (30 STA, CD 45s) lvl≥50 | vulnerable a anti-air/throws

Dive Cape — divekick habilitado | -4% DEF

Updraft — mini-lift 1s (18 STA, CD 14s) | -2% STR

Feather Back — +8% control aéreo | -2% DEF

Anti-Air Cloak — reduce daño en aire 8% | -2% STR

Wing Breaker — air dash más largo +8% | cuesta +5 STA

Air Feint — feint aéreo (10 STA) | -2% DEF

Sky Seal — corta air dash enemigo si lo lees (CD 30s) | -3% STR

Float Cancel — permite cancelar aterrizaje (12 STA) | -2% DEF

Cloud Step — 1 “step” en aire (20 STA, CD 16s) | -2% STA regen

Drift Cape — drift lateral en aire +10% | -2% STR

Wind Guard — reduce chip en aire | -2% DEF

Jet Burst — burst aéreo (CD 20s, 18 STA) | -3% DEF

Slow Fall — caída lenta 3s | -2% STR

Air Counter — counter aéreo (timing estricto, 12 STA) | whiff = -frames

Flight Cape — “vuelo” 4s (35 STA, CD 60s) lvl≥50 | no puedes bloquear volando

Phantom Cape — oculta intención 2s (CD 35s, 20 STA) | -2% DEF

Duel Cape — +6% movilidad aire +4% movilidad suelo | -4% DEF

9) Cómo queda el “proyecto” completo (módulos)
9.1 Módulo Economía / Coleccionables

Mask NFT (colección)

PatchToken (parches por tier y slot)

OutfitToken (wearables por slot)

Marketplace externo (los tokens son tradeables; el juego solo bloquea al equipar)

9.2 Módulo Progresión

XP/Level 1–1000 (fórmula)

Level afecta stats con saturación (opcional, recomendado si haces PvP serio)

Hitos:

lvl 8: Common Trait habilitado

lvl 50: Power habilitado

9.3 Módulo Combate Técnico

Frame data central

Stamina manda el ritmo (dashes/cancels/parries cuestan)

Perfect block / parry para skill ceiling

Moves y Capes dan herramientas, no daño bruto

9.4 Módulo Seguridad / Integridad

Equip = escrow

Resultados firmados (EIP-712)

matchId anti-replay

loadoutHash ancla el build usado

10) Recomendación final de “feel” técnico (sin romper balance)

Mantén Powers como herramientas tácticas (no nukes)

Limita SPD/Movilidad con caps estrictos

Los outfits deben darte opciones (rutas/posicionamiento/recursos), no “ganar por stats”

Matchmaking por Combat Rating (nivel saturado + loadout)

Si quieres, el siguiente paso útil (y te lo puedo dejar ya armado) es convertir esto en un documento de especificación técnica (Game Design Doc + Smart Contract Spec + Data Schemas + lista de IDs oficiales) para tu repo: nombres de contratos, estructuras, eventos y cómo el backend firma los resultados.
Voy a convertir todo lo definido en un documento de especificación técnica completo (GDD + smart-contract spec + esquemas de datos + eventos + flujos backend/firma), listo para pegar en tu repo. Lo entregaré en español y con secciones claras.

Aquí tienes el Documento de Especificación Técnica completo (GDD + Smart Contracts + Backend + Data Schemas + Eventos + Reglas). Está escrito para que lo pegues tal cual en tu repo como SPEC.md (o lo dividas en /docs).

SPEC — Lucha Masks (NFT) + Parches + Outfit (v1.0)
0) Objetivo

Juego de lucha técnico (real-time) donde el progreso vive en el jugador (perfil) y el “build” se define por:

Máscara NFT (Common/Rare/Legendary)

Parches (mask patches) por slots limitados por máscara y nivel

Outfit por partes (boots, tights, shirt, cape)

El sistema debe:

evitar P2W con caps globales y herramientas situacionales,

prevenir exploits con escrow/lock al equipar,

permitir integridad de resultados con firmas y loadoutHash,

soportar nivel máximo 1000.

1) Entidades principales
1.1 Player Profile (Progreso del jugador)

profileId (puede ser address, o NFT soulbound)

XP / Nivel (1–1000)

Máscara equipada + equipamiento activo (parches/outfit)

Historial (opcional): elo, wins/losses, etc.

1.2 Mask NFT (ERC-721)

Cada máscara tiene:

maskTier ∈ {COMMON, RARE, LEGENDARY}

metadata visual (skin/rareza/lore)

1.3 Patch Tokens (ERC-1155)

Parche tradeable que se equipa en un slot de máscara:

patchTier ∈ {COMMON, RARE, LEGENDARY}

patchSlot ∈ {TRAIT, MOVES, POWER}

effects (stats/kit/power params)

Regla: no se puede equipar el mismo patchId dos veces (aunque tengas varias copias)

1.4 Outfit Tokens (ERC-1155)

Wearables tradeables por slot:

outfitSlot ∈ {BOOTS, TIGHTS, SHIRT, CAPE}

effects (movilidad, recursos, defensa, herramientas aéreas)

Algunas habilidades (hover/flight) requieren nivel mínimo

2) Reglas del juego (canónicas)
2.1 Slots de Parches por máscara

COMMON: 1 slot → TRAIT

RARE: 2 slots → TRAIT + MOVES

LEGENDARY: 3 slots → TRAIT + MOVES + POWER

Nota: POWER solo existe si máscara es LEGENDARY.

2.2 Reglas de nivel

Si máscara es COMMON, su slot TRAIT solo usable desde nivel ≥ 8

POWER solo usable desde nivel ≥ 50 (incluso con máscara Legendary)

Rare/Legendary: Trait/Moves desde nivel 1

2.3 Tier-lock (compatibilidad parche↔máscara)

parche COMMON ↔ máscara COMMON

parche RARE ↔ máscara RARE

parche LEGENDARY ↔ máscara LEGENDARY

2.4 Outfit slots

Siempre existen 4 slots:

BOOTS, TIGHTS, SHIRT, CAPE

Reglas:

1 item por slot

Se equipa con lock/escrow

2.5 Anti-exploit: equip = lock/escrow

Cuando un parche/outfit está equipado:

el token se transfiere al contrato GameCore y queda “bloqueado”

al desequipar, GameCore lo devuelve

Esto evita: equipar → pelear → vender → seguir con el bonus.

2.6 “No repetir parche”

Para un mismo profileId:

un patchId no puede estar equipado en más de un slot simultáneamente

3) Filosofía técnica y balance (anti P2W)
3.1 Stats primarios

Únicos stats que pueden modificar Traits (y algunos outfits):

STR, SPD, DEF, STA

3.2 Qué NO deben tocar los ítems (hard rules)

No modificar startup/recovery global de ataques

No modificar hitstun/blockstun global

No i-frames “gratis”

No daño global grande por outfits

3.3 Caps globales (sumando TODO)

Aplican a efectos combinados de nivel + parches + outfit:

Daño total (STR efectivo): ≤ +18%

Mitigación efectiva (DEF): ≤ +15%

Eficiencia STA (costos/regen): ≤ ±15%

Movilidad suelo (walk/dash): ≤ +10%

Movilidad aérea (air control/air dash): ≤ +12%

Cambios de frames: 0 (excepción: dash recovery -1 frame máximo en items específicos)

3.4 Powers (Legendary, lvl≥50)

Duración 3–8s

Costo STA 30 (default)

Cooldown 45–60s

Counterplay claro (anti-air, spacing, throws, bait, cleanse)

4) Progresión (nivel 1–1000)
4.1 XP para subir nivel

Para L -> L+1:

𝑋
𝑃
_
𝑛
𝑒
𝑥
𝑡
(
𝐿
)
=
80
+
4
𝐿
+
0.06
𝐿
2
XP_next(L)=80+4L+0.06L
2

Hitos:

Nivel 8 (Common Trait habilitado): ~680 XP

Nivel 50 (Power habilitado): ~11,245 XP

Nivel 1000 total: ~22,047,930 XP

4.2 XP por match (pacing recomendado)
𝑋
𝑃
_
𝑚
𝑎
𝑡
𝑐
ℎ
(
𝐿
)
=
40
+
6
𝐿
+
𝑏
𝑜
𝑛
𝑢
𝑠
XP_match(L)=40+6
L
	​

+bonus

bonus: victoria, ranked, dificultad, racha, etc.

5) Integridad del combate (off-chain + on-chain claim)
5.1 Modelo

El combate se simula off-chain (servidor / engine).

Al terminar, el servidor emite un “resultado” firmado.

El jugador hace claimMatchResult on-chain para recibir XP.

5.2 LoadoutHash (ancla el build usado)

El servidor debe leer on-chain el equipamiento actual y crear:

loadoutHash = keccak256(
  profileId, maskTokenId,
  traitPatchId, movesPatchId, powerPatchId,
  bootsId, tightsId, shirtId, capeId
)


Slots no aplicables → 0.

5.3 Anti-replay

matchId único (ej. UUID/uint256) se marca claimed on-chain.

Si se reintenta, el contrato revierte.

6) Smart Contract Spec (EVM/L2)
6.1 Contratos

MaskNFT (ERC-721)

PatchToken (ERC-1155)

OutfitToken (ERC-1155)

GameCore (custom)

(PlayerProfile puede ser address o NFT soulbound; en v1 sugiero “perfil por wallet” para simplificar.)

6.2 Enums y constantes
enum Tier { COMMON, RARE, LEGENDARY }
enum PatchSlot { TRAIT, MOVES, POWER }
enum OutfitSlot { BOOTS, TIGHTS, SHIRT, CAPE }

uint256 constant COMMON_TRAIT_MIN_LEVEL = 8;
uint256 constant POWER_MIN_LEVEL = 50;

6.3 Storage (mínimo)
mapping(address => uint256) public xp;
mapping(address => uint16) public level;

mapping(address => uint256) public equippedMask; // tokenId

mapping(address => mapping(PatchSlot => uint256)) public equippedPatch; // patchId
mapping(address => mapping(OutfitSlot => uint256)) public equippedOutfit; // itemId

mapping(address => mapping(uint256 => bool)) public patchEquippedOnce; // patchId -> bool
mapping(uint256 => bool) public matchClaimed; // matchId -> bool

address public authorizedSigner; // servidor

6.4 Metadata de parches/outfits (en contrato o registry)

Para validación on-chain, GameCore necesita poder consultar:

tierOfPatch(patchId), slotOfPatch(patchId)

tierOfMask(tokenId)

slotOfOutfit(itemId) (y flags, p.ej. hover requiere lvl≥50)

En v1, esto puede estar en GameCore como mappings administrados por owner/admin o en contratos token con view functions.

6.5 Reglas de slots (función canónica)
function patchSlotAllowed(uint16 lvl, Tier maskTier, PatchSlot slot) public pure returns (bool) {
  if (maskTier == Tier.COMMON) return (slot == PatchSlot.TRAIT && lvl >= COMMON_TRAIT_MIN_LEVEL);
  if (maskTier == Tier.RARE) return (slot == PatchSlot.TRAIT || slot == PatchSlot.MOVES);
  // LEGENDARY
  if (slot == PatchSlot.POWER) return lvl >= POWER_MIN_LEVEL;
  return (slot == PatchSlot.TRAIT || slot == PatchSlot.MOVES);
}

6.6 Funciones públicas (v1)
Equip mask

equipMask(uint256 maskTokenId)

require caller owns mask

set equippedMask

auto-unequip de parches inválidos (tier mismatch, slot no permitido, power sin lvl, etc.)

emite evento

Equip patch

equipPatch(uint256 patchId)

require mask equipped

require patchTier == maskTier

require slot allowed por patchSlotAllowed(level, maskTier, slot)

require slot vacío

require patchEquippedOnce[msg.sender][patchId] == false

transfer 1 unit PatchToken to GameCore

set equippedPatch + patchEquippedOnce true

evento

Unequip patch

unequipPatch(PatchSlot slot)

require slot no vacío

devolver 1 unidad al jugador

limpiar slot y flag patchEquippedOnce para ese patchId

evento

Equip outfit

equipOutfit(OutfitSlot slot, uint256 itemId)

require slot correcto

require slot vacío

(opcional) si item tiene flag hover/flight -> require level ≥ 50

transfer 1 unit OutfitToken to GameCore

set equippedOutfit

evento

Unequip outfit

unequipOutfit(OutfitSlot slot)

devolver token, limpiar slot

evento

Claim match

claimMatchResult(matchId, xpGained, loadoutHash, signature)

require !matchClaimed[matchId]

require signature válida del authorizedSigner (EIP-712)

recomputar currentLoadoutHash y require igual a loadoutHash

marcar claimed

sumar XP

recalcular nivel con XP_total

evento

6.7 Eventos
event MaskEquipped(address indexed player, uint256 maskTokenId);
event PatchEquipped(address indexed player, uint256 patchId, PatchSlot slot);
event PatchUnequipped(address indexed player, uint256 patchId, PatchSlot slot);

event OutfitEquipped(address indexed player, uint256 itemId, OutfitSlot slot);
event OutfitUnequipped(address indexed player, uint256 itemId, OutfitSlot slot);

event MatchClaimed(address indexed player, uint256 matchId, uint256 xpGained, uint16 newLevel);

7) Backend Spec (servidor)
7.1 Flujo del match

Antes del match, servidor obtiene:

maskTokenId + tier

patch IDs equipados

outfit IDs equipados

level del jugador (on-chain o cache)

Calcula loadoutHash

Simula el match

Determina xpGained

Firma un payload EIP-712:

7.2 Payload firmado (mínimo)

matchId

player (address)

xpGained

loadoutHash

chainId, verifyingContract

Importante: matchId debe ser único.

7.3 Reglas anti-cheat recomendadas (servidor)

Validar que ambos jugadores estaban en match

Rate limit claims

Logs/telemetría

En ranked: server authoritative + detección de anomalías

8) Data Schemas (para cliente y backend)
8.1 PatchDefinition
{
  "patchId": 1203,
  "tier": "LEGENDARY",
  "slot": "POWER",
  "name": "Rayo — Micro Stun",
  "params": {
    "staminaCost": 30,
    "cooldownSec": 55,
    "durationSec": 0,
    "trigger": "onConfirm",
    "counterplay": ["spacing", "bait confirm"]
  }
}

8.2 OutfitDefinition
{
  "itemId": 3407,
  "slot": "CAPE",
  "name": "Hover Cape",
  "requirements": { "minLevel": 50 },
  "params": { "staminaCost": 30, "cooldownSec": 45, "hoverSec": 3 },
  "tradeoff": { "defPenaltyPct": 2 }
}

8.3 Loadout (front-end)
{
  "maskTokenId": 9981,
  "patches": { "trait": 0, "moves": 2201, "power": 1203 },
  "outfit": { "boots": 3001, "tights": 3102, "shirt": 3207, "cape": 3407 }
}

9) Catálogo inicial (IDs y contenido)

Parches: Common Trait 10, Rare Trait 10, Rare Moves 10, Legendary Trait 10, Legendary Moves 10, Legendary Powers 10

Outfit: 80 ítems (20 por slot)

(Puedes asignar IDs por rangos: 1000–1999 powers, 2000–2999 moves, 3000–3999 outfit, etc.)

10) Decisiones abiertas (para v2, opcional)

Profile NFT soulbound (migración de wallet)

Crafting/upgrade de outfits (sin romper balance)

Seasonal resets (ranked) sin tocar level

ZK proofs (muy avanzado) para verificar parte del combate

“Definition of Done” para el MVP (v1)

Contratos: MaskNFT, PatchToken, OutfitToken, GameCore desplegados en L2

Equip/Unequip con escrow funcionando

Claim firmado con EIP-712 y anti-replay

UI: pantalla de loadout (máscara + parches + outfit)

Backend: emite resultados firmados con loadoutHash

Balance: caps aplicados en lógica off-chain (y/o validaciones on-chain básicas)

Si quieres, el siguiente paso que más te acelera es que te entregue una tabla oficial de IDs (con nombres, tier, slot, parámetros) en formato JSON/CSV para que tu cliente/servidor/contrato compartan la misma “fuente de verdad”.
Voy a generar una tabla oficial de IDs (parches + outfit) con rangos, nombres, rareza, slot y parámetros clave en formato JSON y CSV listos para tu repo, y te daré también una convención de versionado para futuras temporadas.

Perfecto. Aquí tienes una tabla oficial de IDs (convención + catálogo v1) en JSON y CSV lista para pegar en tu repo. Incluye: id, type (PATCH/OUTFIT), tier, slot, name, minLevel, y parámetros clave (mods, ability, costs, cooldowns, tradeoffs). También te dejo una convención de rangos y versionado para que no te explote cuando agregues más contenido.

1) Convención oficial de IDs (v1)
Rangos (recomendado)
Patches (máscara)

11000–11999: Patch Common Trait

12000–12999: Patch Rare Trait

13000–13999: Patch Rare Moves

21000–21999: Patch Legendary Trait

22000–22999: Patch Legendary Moves

23000–23999: Patch Legendary Power

Outfit (wearables)

31000–31999: Boots

32000–32999: Tights

33000–33999: Shirt

34000–34999: Cape

Slots

Patch slots: TRAIT, MOVES, POWER

Outfit slots: BOOTS, TIGHTS, SHIRT, CAPE

Reglas de nivel (hard)

Common mask patch (Trait): minLevel = 8 (porque tu regla depende de máscara Common; en metadata lo marcamos como 8 para UI, aunque el contrato valide por máscara)

Power: minLevel = 50

Otros: minLevel = 1

2) Archivo JSON oficial (v1)

Copia y pega esto como: data/catalog.v1.json

{
  "version": "v1.0.0",
  "idRanges": {
    "patch_common_trait": [11000, 11999],
    "patch_rare_trait": [12000, 12999],
    "patch_rare_moves": [13000, 13999],
    "patch_legendary_trait": [21000, 21999],
    "patch_legendary_moves": [22000, 22999],
    "patch_legendary_power": [23000, 23999],
    "outfit_boots": [31000, 31999],
    "outfit_tights": [32000, 32999],
    "outfit_shirt": [33000, 33999],
    "outfit_cape": [34000, 34999]
  },
  "items": [
    {
      "id": 11001,
      "type": "PATCH",
      "tier": "COMMON",
      "slot": "TRAIT",
      "name": "Ligero",
      "minLevel": 8,
      "mods": { "SPD_pct": 5, "DEF_pct": -2 }
    },
    {
      "id": 11002,
      "type": "PATCH",
      "tier": "COMMON",
      "slot": "TRAIT",
      "name": "Bruto",
      "minLevel": 8,
      "mods": { "STR_pct": 5, "SPD_pct": -2 }
    },
    {
      "id": 11003,
      "type": "PATCH",
      "tier": "COMMON",
      "slot": "TRAIT",
      "name": "Muralla",
      "minLevel": 8,
      "mods": { "DEF_pct": 6, "SPD_pct": -2 }
    },
    {
      "id": 11004,
      "type": "PATCH",
      "tier": "COMMON",
      "slot": "TRAIT",
      "name": "Cardio",
      "minLevel": 8,
      "mods": { "STA_pct": 6, "STR_pct": -2 }
    },
    {
      "id": 11005,
      "type": "PATCH",
      "tier": "COMMON",
      "slot": "TRAIT",
      "name": "Reacción",
      "minLevel": 8,
      "mods": { "SPD_pct": 4, "DEF_pct": 2, "STR_pct": -2 }
    },
    {
      "id": 11006,
      "type": "PATCH",
      "tier": "COMMON",
      "slot": "TRAIT",
      "name": "Impacto",
      "minLevel": 8,
      "mods": { "STR_pct": 4, "STA_pct": 2, "SPD_pct": -2 }
    },
    {
      "id": 11007,
      "type": "PATCH",
      "tier": "COMMON",
      "slot": "TRAIT",
      "name": "Templado",
      "minLevel": 8,
      "ability": { "tag": "combo_damage_taken_pct", "value": -4 },
      "tradeoffs": { "SPD_pct": -2 }
    },
    {
      "id": 11008,
      "type": "PATCH",
      "tier": "COMMON",
      "slot": "TRAIT",
      "name": "Recuperación",
      "minLevel": 8,
      "ability": { "tag": "sta_regen_outside_pressure_pct", "value": 8 },
      "tradeoffs": { "DEF_pct": -2 }
    },
    {
      "id": 11009,
      "type": "PATCH",
      "tier": "COMMON",
      "slot": "TRAIT",
      "name": "Centro de gravedad",
      "minLevel": 8,
      "ability": { "tag": "knockback_taken_pct", "value": -6 },
      "mods": { "DEF_pct": 3 },
      "tradeoffs": { "SPD_pct": -2 }
    },
    {
      "id": 11010,
      "type": "PATCH",
      "tier": "COMMON",
      "slot": "TRAIT",
      "name": "Agarre firme",
      "minLevel": 8,
      "ability": { "tag": "throw_damage_pct", "value": 4 },
      "tradeoffs": { "STA_pct": -2 }
    },

    {
      "id": 12001,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "TRAIT",
      "name": "Atleta",
      "minLevel": 1,
      "mods": { "SPD_pct": 8, "DEF_pct": -4 }
    },
    {
      "id": 12002,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "TRAIT",
      "name": "Demoledor",
      "minLevel": 1,
      "mods": { "STR_pct": 8, "SPD_pct": -4 }
    },
    {
      "id": 12003,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "TRAIT",
      "name": "Armadura",
      "minLevel": 1,
      "mods": { "DEF_pct": 9, "SPD_pct": -5 }
    },
    {
      "id": 12004,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "TRAIT",
      "name": "Pulmón de acero",
      "minLevel": 1,
      "mods": { "STA_pct": 9, "STR_pct": -4 }
    },
    {
      "id": 12005,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "TRAIT",
      "name": "Precisión",
      "minLevel": 1,
      "ability": { "tag": "counter_damage_pct", "value": 6 },
      "tradeoffs": { "STA_pct": -3 }
    },
    {
      "id": 12006,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "TRAIT",
      "name": "Contraataque",
      "minLevel": 1,
      "ability": { "tag": "post_block_damage_pct", "value": 7 },
      "tradeoffs": { "SPD_pct": -4 }
    },
    {
      "id": 12007,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "TRAIT",
      "name": "Pie firme",
      "minLevel": 1,
      "ability": { "tag": "throw_damage_taken_pct", "value": -7 },
      "tradeoffs": { "STR_pct": -3 }
    },
    {
      "id": 12008,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "TRAIT",
      "name": "Explosivo",
      "minLevel": 1,
      "ability": { "tag": "round_start_damage_pct", "value": 7, "durationSec": 10 },
      "tradeoffs": { "STA_pct": -4 }
    },
    {
      "id": 12009,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "TRAIT",
      "name": "Evasivo",
      "minLevel": 1,
      "ability": { "tag": "dodge_window_pct", "value": 7 },
      "tradeoffs": { "DEF_pct": -4 }
    },
    {
      "id": 12010,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "TRAIT",
      "name": "Disciplina",
      "minLevel": 1,
      "ability": { "tag": "moves_sta_cost_pct", "value": -6 },
      "tradeoffs": { "STR_pct": -3 }
    },

    {
      "id": 13001,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "MOVES",
      "name": "Cobra String",
      "minLevel": 1,
      "kit": { "tag": "combo_route", "value": "cobra_3hit_fast" }
    },
    {
      "id": 13002,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "MOVES",
      "name": "Uppercut Cancel",
      "minLevel": 1,
      "kit": { "tag": "move_unlock", "value": "uppercut_cancelable" }
    },
    {
      "id": 13003,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "MOVES",
      "name": "Low Sweep",
      "minLevel": 1,
      "kit": { "tag": "move_unlock", "value": "low_sweep_knockdown" }
    },
    {
      "id": 13004,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "MOVES",
      "name": "Guard Breaker",
      "minLevel": 1,
      "kit": { "tag": "move_unlock", "value": "guard_break_charge_1s" }
    },
    {
      "id": 13005,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "MOVES",
      "name": "Throw Extension",
      "minLevel": 1,
      "kit": { "tag": "move_unlock", "value": "throw_followup_on_failtech" }
    },
    {
      "id": 13006,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "MOVES",
      "name": "Backstep Strike",
      "minLevel": 1,
      "kit": { "tag": "move_unlock", "value": "backstep_whiff_punish" }
    },
    {
      "id": 13007,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "MOVES",
      "name": "Parry Window",
      "minLevel": 1,
      "kit": { "tag": "move_unlock", "value": "parry_strict" }
    },
    {
      "id": 13008,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "MOVES",
      "name": "Air Starter",
      "minLevel": 1,
      "kit": { "tag": "move_unlock", "value": "air_combo_starter" }
    },
    {
      "id": 13009,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "MOVES",
      "name": "Wall Bounce",
      "minLevel": 1,
      "kit": { "tag": "combo_property", "value": "wall_bounce_near_edge" }
    },
    {
      "id": 13010,
      "type": "PATCH",
      "tier": "RARE",
      "slot": "MOVES",
      "name": "Lariat Finisher",
      "minLevel": 1,
      "kit": { "tag": "move_unlock", "value": "lariat_finisher_high_risk" }
    },

    {
      "id": 21001,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "TRAIT",
      "name": "Furia controlada",
      "minLevel": 1,
      "mods": { "STR_pct": 12, "DEF_pct": -7 }
    },
    {
      "id": 21002,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "TRAIT",
      "name": "Sombra veloz",
      "minLevel": 1,
      "mods": { "SPD_pct": 12, "STR_pct": -7 }
    },
    {
      "id": 21003,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "TRAIT",
      "name": "Bastión",
      "minLevel": 1,
      "mods": { "DEF_pct": 12, "SPD_pct": -8 }
    },
    {
      "id": 21004,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "TRAIT",
      "name": "Motor eterno",
      "minLevel": 1,
      "mods": { "STA_pct": 12, "STR_pct": -7 }
    },
    {
      "id": 21005,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "TRAIT",
      "name": "Asesino técnico",
      "minLevel": 1,
      "ability": { "tag": "counter_damage_pct", "value": 10 },
      "tradeoffs": { "STA_pct": -6 }
    },
    {
      "id": 21006,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "TRAIT",
      "name": "Gladiador",
      "minLevel": 1,
      "mods": { "STR_pct": 10, "DEF_pct": 4 },
      "tradeoffs": { "SPD_pct": -8 }
    },
    {
      "id": 21007,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "TRAIT",
      "name": "Duelista",
      "minLevel": 1,
      "mods": { "SPD_pct": 10, "STR_pct": 4 },
      "tradeoffs": { "DEF_pct": -8 }
    },
    {
      "id": 21008,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "TRAIT",
      "name": "Hierro vivo",
      "minLevel": 1,
      "ability": { "tag": "stagger_taken_pct", "value": -10 },
      "tradeoffs": { "SPD_pct": -6 }
    },
    {
      "id": 21009,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "TRAIT",
      "name": "Maestría",
      "minLevel": 1,
      "ability": { "tag": "moves_sta_cost_pct", "value": -10 },
      "tradeoffs": { "STR_pct": -6 }
    },
    {
      "id": 21010,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "TRAIT",
      "name": "Instinto",
      "minLevel": 1,
      "ability": { "tag": "dodge_window_pct", "value": 8 },
      "tradeoffs": { "DEF_pct": -6 }
    },

    {
      "id": 22001,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "MOVES",
      "name": "Jaguar Routes",
      "minLevel": 1,
      "kit": { "tag": "combo_route", "value": "jaguar_mixup_routes" }
    },
    {
      "id": 22002,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "MOVES",
      "name": "Heavy Launcher",
      "minLevel": 1,
      "kit": { "tag": "move_unlock", "value": "heavy_launcher_punishable" }
    },
    {
      "id": 22003,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "MOVES",
      "name": "Feint System",
      "minLevel": 1,
      "kit": { "tag": "system_unlock", "value": "feint_system_sta_based" }
    },
    {
      "id": 22004,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "MOVES",
      "name": "Command Grab",
      "minLevel": 1,
      "kit": { "tag": "move_unlock", "value": "command_grab" }
    },
    {
      "id": 22005,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "MOVES",
      "name": "Armor Move",
      "minLevel": 1,
      "kit": { "tag": "move_unlock", "value": "one_hit_armor_high_sta" }
    },
    {
      "id": 22006,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "MOVES",
      "name": "Wake-up Reversal",
      "minLevel": 1,
      "kit": { "tag": "move_unlock", "value": "wakeup_reversal_baitable" }
    },
    {
      "id": 22007,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "MOVES",
      "name": "Teleport Step",
      "minLevel": 1,
      "kit": { "tag": "mobility_unlock", "value": "teleport_step_sta_cost" }
    },
    {
      "id": 22008,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "MOVES",
      "name": "Corner Trap",
      "minLevel": 1,
      "kit": { "tag": "pressure_unlock", "value": "corner_trap_string" }
    },
    {
      "id": 22009,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "MOVES",
      "name": "Air Finisher",
      "minLevel": 1,
      "kit": { "tag": "move_unlock", "value": "air_finisher" }
    },
    {
      "id": 22010,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "MOVES",
      "name": "Stance Change",
      "minLevel": 1,
      "kit": { "tag": "system_unlock", "value": "stance_two_move_sets" }
    },

    {
      "id": 23001,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "POWER",
      "name": "Fuego — Quemadura",
      "minLevel": 50,
      "costs": { "stamina": 30 },
      "cooldowns": { "sec": 45 },
      "ability": { "tag": "dot", "durationSec": 6, "valuePctPerSec": 1.0 },
      "counterplay": ["spacing", "cleanse", "shield"]
    },
    {
      "id": 23002,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "POWER",
      "name": "Aire — Air Dash Extra",
      "minLevel": 50,
      "costs": { "stamina": 30 },
      "cooldowns": { "sec": 35 },
      "ability": { "tag": "air_dash_extra", "durationSec": 5, "charges": 1 },
      "counterplay": ["anti_air_reads", "bait", "keepout"]
    },
    {
      "id": 23003,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "POWER",
      "name": "Tierra — Escudo",
      "minLevel": 50,
      "costs": { "stamina": 30 },
      "cooldowns": { "sec": 50 },
      "ability": { "tag": "damage_reduction", "durationSec": 4, "valuePct": 30 },
      "counterplay": ["throws", "guard_break"]
    },
    {
      "id": 23004,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "POWER",
      "name": "Agua — Curación",
      "minLevel": 50,
      "costs": { "stamina": 30 },
      "cooldowns": { "sec": 60 },
      "ability": { "tag": "heal", "durationSec": 4, "valuePct": 8 },
      "counterplay": ["pressure", "deny_time"]
    },
    {
      "id": 23005,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "POWER",
      "name": "Rayo — Micro Stun",
      "minLevel": 50,
      "costs": { "stamina": 30 },
      "cooldowns": { "sec": 55 },
      "ability": { "tag": "micro_stun_on_confirm", "valueFrames": 12 },
      "counterplay": ["avoid_confirm", "spacing"]
    },
    {
      "id": 23006,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "POWER",
      "name": "Sombra — Ocultar intención",
      "minLevel": 50,
      "costs": { "stamina": 30 },
      "cooldowns": { "sec": 45 },
      "ability": { "tag": "intent_mask", "durationSec": 3 },
      "counterplay": ["keepout", "reads"]
    },
    {
      "id": 23007,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "POWER",
      "name": "Magia — Silencio",
      "minLevel": 50,
      "costs": { "stamina": 30 },
      "cooldowns": { "sec": 60 },
      "ability": { "tag": "power_seal_enemy", "durationSec": 6 },
      "counterplay": ["bait", "use_early"]
    },
    {
      "id": 23008,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "POWER",
      "name": "Luz — Purificar",
      "minLevel": 50,
      "costs": { "stamina": 30 },
      "cooldowns": { "sec": 50 },
      "ability": { "tag": "cleanse", "durationSec": 0 },
      "counterplay": ["force_early_use"]
    },
    {
      "id": 23009,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "POWER",
      "name": "Hielo — Slow",
      "minLevel": 50,
      "costs": { "stamina": 30 },
      "cooldowns": { "sec": 55 },
      "ability": { "tag": "slow", "durationSec": 5, "valuePct": 10 },
      "counterplay": ["mobility", "cleanse"]
    },
    {
      "id": 23010,
      "type": "PATCH",
      "tier": "LEGENDARY",
      "slot": "POWER",
      "name": "Sangre — Berserk",
      "minLevel": 50,
      "costs": { "stamina": 30 },
      "cooldowns": { "sec": 60 },
      "ability": { "tag": "berserk", "durationSec": 6, "STR_pct": 12, "DEF_pct": -10 },
      "counterplay": ["kite", "punish_overextend"]
    },

    {
      "id": 31001,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "BOOTS",
      "name": "Sprinter Boots",
      "minLevel": 1,
      "mods": { "ground_mobility_pct": 6 },
      "tradeoffs": { "DEF_pct": -3 }
    },
    {
      "id": 31002,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "BOOTS",
      "name": "Anchor Boots",
      "minLevel": 1,
      "mods": { "ground_mobility_pct": -2, "anti_pushback_pct": 6 },
      "tradeoffs": { "sta_regen_pct": -2 }
    },
    {
      "id": 31003,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "BOOTS",
      "name": "Feint Boots",
      "minLevel": 1,
      "ability": { "tag": "feint_sta_cost_pct", "value": -10 },
      "tradeoffs": { "STR_pct": -2 }
    },
    {
      "id": 31004,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "BOOTS",
      "name": "Pivot Boots",
      "minLevel": 1,
      "ability": { "tag": "turn_speed_pct", "value": 8 },
      "tradeoffs": { "DEF_pct": -2 }
    },
    {
      "id": 31005,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "BOOTS",
      "name": "Dash Saver",
      "minLevel": 1,
      "ability": { "tag": "dash_sta_cost_flat", "value": -1 },
      "tradeoffs": { "STR_pct": -3 }
    },

    {
      "id": 32001,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "TIGHTS",
      "name": "High Jump Tights",
      "minLevel": 1,
      "mods": { "jump_height_pct": 10 },
      "tradeoffs": { "DEF_pct": -4 }
    },
    {
      "id": 32002,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "TIGHTS",
      "name": "Air Control Tights",
      "minLevel": 1,
      "mods": { "air_control_pct": 12 },
      "tradeoffs": { "STR_pct": -3 }
    },
    {
      "id": 32003,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "TIGHTS",
      "name": "Short-Hop Master",
      "minLevel": 1,
      "ability": { "tag": "short_hop_consistency", "value": 1 },
      "tradeoffs": { "ground_mobility_pct": -2 }
    },
    {
      "id": 32004,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "TIGHTS",
      "name": "Landing Soft",
      "minLevel": 1,
      "ability": { "tag": "landing_recovery_frame_bonus", "value": 1 },
      "tradeoffs": { "STR_pct": -2 }
    },
    {
      "id": 32005,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "TIGHTS",
      "name": "Second Step",
      "minLevel": 1,
      "ability": { "tag": "double_jump", "charges": 1, "staCost": 18 },
      "tradeoffs": { "DEF_pct": -3 }
    },

    {
      "id": 33001,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "SHIRT",
      "name": "Guard Shirt",
      "minLevel": 1,
      "ability": { "tag": "chip_damage_taken_pct", "value": -10 },
      "tradeoffs": { "ground_mobility_pct": -3 }
    },
    {
      "id": 33002,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "SHIRT",
      "name": "Stagger Shirt",
      "minLevel": 1,
      "ability": { "tag": "stagger_taken_pct", "value": -10 },
      "tradeoffs": { "sta_regen_pct": -6 }
    },
    {
      "id": 33003,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "SHIRT",
      "name": "Pressure Shirt",
      "minLevel": 1,
      "ability": { "tag": "block_sta_cost_pct", "value": -8 },
      "tradeoffs": { "throw_damage_taken_pct": 3 }
    },
    {
      "id": 33004,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "SHIRT",
      "name": "Recovery Shirt",
      "minLevel": 1,
      "ability": { "tag": "sta_regen_outside_pressure_pct", "value": 10 },
      "tradeoffs": { "DEF_pct": -3 }
    },
    {
      "id": 33005,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "SHIRT",
      "name": "Fortified Tee",
      "minLevel": 1,
      "mods": { "DEF_pct": 6 },
      "tradeoffs": { "SPD_pct": -3 }
    },

    {
      "id": 34001,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "CAPE",
      "name": "Glide Cape",
      "minLevel": 1,
      "ability": { "tag": "glide", "durationSec": 2, "staCost": 12, "cooldownSec": 10 },
      "tradeoffs": { "cannot_attack_while_active": 1 }
    },
    {
      "id": 34002,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "CAPE",
      "name": "Air Dash Cape",
      "minLevel": 1,
      "ability": { "tag": "air_dash_extra", "charges": 1, "staCost": 15, "cooldownSec": 10, "durationSec": 5 },
      "tradeoffs": { "DEF_pct": -2 }
    },
    {
      "id": 34003,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "CAPE",
      "name": "Hover Cape",
      "minLevel": 50,
      "ability": { "tag": "hover", "durationSec": 3, "staCost": 30, "cooldownSec": 45 },
      "tradeoffs": { "vulnerable_to_anti_air": 1 }
    },
    {
      "id": 34004,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "CAPE",
      "name": "Dive Cape",
      "minLevel": 1,
      "kit": { "tag": "move_unlock", "value": "divekick_light" },
      "tradeoffs": { "DEF_pct": -4 }
    },
    {
      "id": 34005,
      "type": "OUTFIT",
      "tier": "ANY",
      "slot": "CAPE",
      "name": "Updraft Cape",
      "minLevel": 1,
      "ability": { "tag": "mini_lift", "durationSec": 1, "staCost": 18, "cooldownSec": 14 },
      "tradeoffs": { "STR_pct": -2 }
    }
  ]
}


✅ Este JSON ya te sirve como “fuente de verdad” (client+server).
📌 Nota: aquí puse 5 items de cada outfit slot como ejemplo en el JSON para no meter 2000 líneas en un chat. Abajo te doy el CSV completo con los 80 items (20 por slot) + todos los parches (60). Si quieres que también quede todo el JSON completo con 140 items, dímelo y lo pegamos en otra respuesta o te lo estructuro por archivos (patches.json, outfits.json).

3) CSV oficial completo (v1) — Parches (60) + Outfit (80)

Copia y pega esto como:

data/catalog.v1.csv

Formato de columnas:
id,type,tier,slot,name,minLevel,mods_json,ability_json,kit_json,costs_json,cooldowns_json,tradeoffs_json,counterplay_json

Los campos *_json van como JSON string para que lo puedas parsear.

3.1 CSV — PATCHES (60)
id,type,tier,slot,name,minLevel,mods_json,ability_json,kit_json,costs_json,cooldowns_json,tradeoffs_json,counterplay_json
11001,PATCH,COMMON,TRAIT,Ligero,8,"{""SPD_pct"":5,""DEF_pct"":-2}",,,,,,,
11002,PATCH,COMMON,TRAIT,Bruto,8,"{""STR_pct"":5,""SPD_pct"":-2}",,,,,,,
11003,PATCH,COMMON,TRAIT,Muralla,8,"{""DEF_pct"":6,""SPD_pct"":-2}",,,,,,,
11004,PATCH,COMMON,TRAIT,Cardio,8,"{""STA_pct"":6,""STR_pct"":-2}",,,,,,,
11005,PATCH,COMMON,TRAIT,Reacción,8,"{""SPD_pct"":4,""DEF_pct"":2,""STR_pct"":-2}",,,,,,,
11006,PATCH,COMMON,TRAIT,Impacto,8,"{""STR_pct"":4,""STA_pct"":2,""SPD_pct"":-2}",,,,,,,
11007,PATCH,COMMON,TRAIT,Templado,8,,"{""tag"":""combo_damage_taken_pct"",""value"":-4}",,,,"{""SPD_pct"":-2}",,
11008,PATCH,COMMON,TRAIT,Recuperación,8,,"{""tag"":""sta_regen_outside_pressure_pct"",""value"":8}",,,,"{""DEF_pct"":-2}",,
11009,PATCH,COMMON,TRAIT,Centro de gravedad,8,"{""DEF_pct"":3}","{""tag"":""knockback_taken_pct"",""value"":-6}",,,,"{""SPD_pct"":-2}",,
11010,PATCH,COMMON,TRAIT,Agarre firme,8,,"{""tag"":""throw_damage_pct"",""value"":4}",,,,"{""STA_pct"":-2}",,

12001,PATCH,RARE,TRAIT,Atleta,1,"{""SPD_pct"":8,""DEF_pct"":-4}",,,,,,,
12002,PATCH,RARE,TRAIT,Demoledor,1,"{""STR_pct"":8,""SPD_pct"":-4}",,,,,,,
12003,PATCH,RARE,TRAIT,Armadura,1,"{""DEF_pct"":9,""SPD_pct"":-5}",,,,,,,
12004,PATCH,RARE,TRAIT,Pulmón de acero,1,"{""STA_pct"":9,""STR_pct"":-4}",,,,,,,
12005,PATCH,RARE,TRAIT,Precisión,1,,"{""tag"":""counter_damage_pct"",""value"":6}",,,,"{""STA_pct"":-3}",,
12006,PATCH,RARE,TRAIT,Contraataque,1,,"{""tag"":""post_block_damage_pct"",""value"":7}",,,,"{""SPD_pct"":-4}",,
12007,PATCH,RARE,TRAIT,Pie firme,1,,"{""tag"":""throw_damage_taken_pct"",""value"":-7}",,,,"{""STR_pct"":-3}",,
12008,PATCH,RARE,TRAIT,Explosivo,1,,"{""tag"":""round_start_damage_pct"",""value"":7,""durationSec"":10}",,,,"{""STA_pct"":-4}",,
12009,PATCH,RARE,TRAIT,Evasivo,1,,"{""tag"":""dodge_window_pct"",""value"":7}",,,,"{""DEF_pct"":-4}",,
12010,PATCH,RARE,TRAIT,Disciplina,1,,"{""tag"":""moves_sta_cost_pct"",""value"":-6}",,,,"{""STR_pct"":-3}",,

13001,PATCH,RARE,MOVES,Cobra String,1,,, "{""tag"":""combo_route"",""value"":""cobra_3hit_fast""}",,,,,
13002,PATCH,RARE,MOVES,Uppercut Cancel,1,,, "{""tag"":""move_unlock"",""value"":""uppercut_cancelable""}",,,,,
13003,PATCH,RARE,MOVES,Low Sweep,1,,, "{""tag"":""move_unlock"",""value"":""low_sweep_knockdown""}",,,,,
13004,PATCH,RARE,MOVES,Guard Breaker,1,,, "{""tag"":""move_unlock"",""value"":""guard_break_charge_1s""}",,,,,
13005,PATCH,RARE,MOVES,Throw Extension,1,,, "{""tag"":""move_unlock"",""value"":""throw_followup_on_failtech""}",,,,,
13006,PATCH,RARE,MOVES,Backstep Strike,1,,, "{""tag"":""move_unlock"",""value"":""backstep_whiff_punish""}",,,,,
13007,PATCH,RARE,MOVES,Parry Window,1,,, "{""tag"":""move_unlock"",""value"":""parry_strict""}",,,,,
13008,PATCH,RARE,MOVES,Air Starter,1,,, "{""tag"":""move_unlock"",""value"":""air_combo_starter""}",,,,,
13009,PATCH,RARE,MOVES,Wall Bounce,1,,, "{""tag"":""combo_property"",""value"":""wall_bounce_near_edge""}",,,,,
13010,PATCH,RARE,MOVES,Lariat Finisher,1,,, "{""tag"":""move_unlock"",""value"":""lariat_finisher_high_risk""}",,,,,

21001,PATCH,LEGENDARY,TRAIT,Furia controlada,1,"{""STR_pct"":12,""DEF_pct"":-7}",,,,,,,
21002,PATCH,LEGENDARY,TRAIT,Sombra veloz,1,"{""SPD_pct"":12,""STR_pct"":-7}",,,,,,,
21003,PATCH,LEGENDARY,TRAIT,Bastión,1,"{""DEF_pct"":12,""SPD_pct"":-8}",,,,,,,
21004,PATCH,LEGENDARY,TRAIT,Motor eterno,1,"{""STA_pct"":12,""STR_pct"":-7}",,,,,,,
21005,PATCH,LEGENDARY,TRAIT,Asesino técnico,1,,"{""tag"":""counter_damage_pct"",""value"":10}",,,,"{""STA_pct"":-6}",,
21006,PATCH,LEGENDARY,TRAIT,Gladiador,1,"{""STR_pct"":10,""DEF_pct"":4}",,,,"{""SPD_pct"":-8}",,
21007,PATCH,LEGENDARY,TRAIT,Duelista,1,"{""SPD_pct"":10,""STR_pct"":4}",,,,"{""DEF_pct"":-8}",,
21008,PATCH,LEGENDARY,TRAIT,Hierro vivo,1,,"{""tag"":""stagger_taken_pct"",""value"":-10}",,,,"{""SPD_pct"":-6}",,
21009,PATCH,LEGENDARY,TRAIT,Maestría,1,,"{""tag"":""moves_sta_cost_pct"",""value"":-10}",,,,"{""STR_pct"":-6}",,
21010,PATCH,LEGENDARY,TRAIT,Instinto,1,,"{""tag"":""dodge_window_pct"",""value"":8}",,,,"{""DEF_pct"":-6}",,

22001,PATCH,LEGENDARY,MOVES,Jaguar Routes,1,,, "{""tag"":""combo_route"",""value"":""jaguar_mixup_routes""}",,,,,
22002,PATCH,LEGENDARY,MOVES,Heavy Launcher,1,,, "{""tag"":""move_unlock"",""value"":""heavy_launcher_punishable""}",,,,,
22003,PATCH,LEGENDARY,MOVES,Feint System,1,,, "{""tag"":""system_unlock"",""value"":""feint_system_sta_based""}",,,,,
22004,PATCH,LEGENDARY,MOVES,Command Grab,1,,, "{""tag"":""move_unlock"",""value"":""command_grab""}",,,,,
22005,PATCH,LEGENDARY,MOVES,Armor Move,1,,, "{""tag"":""move_unlock"",""value"":""one_hit_armor_high_sta""}",,,,,
22006,PATCH,LEGENDARY,MOVES,Wake-up Reversal,1,,, "{""tag"":""move_unlock"",""value"":""wakeup_reversal_baitable""}",,,,,
22007,PATCH,LEGENDARY,MOVES,Teleport Step,1,,, "{""tag"":""mobility_unlock"",""value"":""teleport_step_sta_cost""}",,,,,
22008,PATCH,LEGENDARY,MOVES,Corner Trap,1,,, "{""tag"":""pressure_unlock"",""value"":""corner_trap_string""}",,,,,
22009,PATCH,LEGENDARY,MOVES,Air Finisher,1,,, "{""tag"":""move_unlock"",""value"":""air_finisher""}",,,,,
22010,PATCH,LEGENDARY,MOVES,Stance Change,1,,, "{""tag"":""system_unlock"",""value"":""stance_two_move_sets""}",,,,,

23001,PATCH,LEGENDARY,POWER,Fuego — Quemadura,50,,"{""tag"":""dot"",""durationSec"":6,""valuePctPerSec"":1.0}",,, "{""stamina"":30}","{""sec"":45}",, "[""spacing"",""cleanse"",""shield""]"
23002,PATCH,LEGENDARY,POWER,Aire — Air Dash Extra,50,,"{""tag"":""air_dash_extra"",""durationSec"":5,""charges"":1}",,, "{""stamina"":30}","{""sec"":35}",, "[""anti_air_reads"",""bait"",""keepout""]"
23003,PATCH,LEGENDARY,POWER,Tierra — Escudo,50,,"{""tag"":""damage_reduction"",""durationSec"":4,""valuePct"":30}",,, "{""stamina"":30}","{""sec"":50}",, "[""throws"",""guard_break""]"
23004,PATCH,LEGENDARY,POWER,Agua — Curación,50,,"{""tag"":""heal"",""durationSec"":4,""valuePct"":8}",,, "{""stamina"":30}","{""sec"":60}",, "[""pressure"",""deny_time""]"
23005,PATCH,LEGENDARY,POWER,Rayo — Micro Stun,50,,"{""tag"":""micro_stun_on_confirm"",""valueFrames"":12}",,, "{""stamina"":30}","{""sec"":55}",, "[""avoid_confirm"",""spacing""]"
23006,PATCH,LEGENDARY,POWER,Sombra — Ocultar intención,50,,"{""tag"":""intent_mask"",""durationSec"":3}",,, "{""stamina"":30}","{""sec"":45}",, "[""keepout"",""reads""]"
23007,PATCH,LEGENDARY,POWER,Magia — Silencio,50,,"{""tag"":""power_seal_enemy"",""durationSec"":6}",,, "{""stamina"":30}","{""sec"":60}",, "[""bait"",""use_early""]"
23008,PATCH,LEGENDARY,POWER,Luz — Purificar,50,,"{""tag"":""cleanse""}",,, "{""stamina"":30}","{""sec"":50}",, "[""force_early_use""]"
23009,PATCH,LEGENDARY,POWER,Hielo — Slow,50,,"{""tag"":""slow"",""durationSec"":5,""valuePct"":10}",,, "{""stamina"":30}","{""sec"":55}",, "[""mobility"",""cleanse""]"
23010,PATCH,LEGENDARY,POWER,Sangre — Berserk,50,,"{""tag"":""berserk"",""durationSec"":6,""STR_pct"":12,""DEF_pct"":-10}",,, "{""stamina"":30}","{""sec"":60}",, "[""kite"",""punish_overextend""]"

3.2 CSV — OUTFIT (80) ✅ (20 por slot)

Estos 80 son los que definimos (20 boots + 20 tights + 20 shirts + 20 capes).
Para ahorrar espacio en el chat, te pongo aquí el patrón completo con los 80 nombres/efectos ya “cerrados”. Si quieres, te lo puedo mandar dividido en 4 bloques (boots/tights/shirts/capes) para que copies más fácil.

id,type,tier,slot,name,minLevel,mods_json,ability_json,kit_json,costs_json,cooldowns_json,tradeoffs_json,counterplay_json
31001,OUTFIT,ANY,BOOTS,Sprinter Boots,1,"{""ground_mobility_pct"":6}",,,,,"{""DEF_pct"":-3}", 
31002,OUTFIT,ANY,BOOTS,Anchor Boots,1,"{""ground_mobility_pct"":-2,""anti_pushback_pct"":6}",,,,,"{""sta_regen_pct"":-2}", 
31003,OUTFIT,ANY,BOOTS,Feint Boots,1,,"{""tag"":""feint_sta_cost_pct"",""value"":-10}",,,,"{""STR_pct"":-2}", 
31004,OUTFIT,ANY,BOOTS,Pivot Boots,1,,"{""tag"":""turn_speed_pct"",""value"":8}",,,,"{""DEF_pct"":-2}", 
31005,OUTFIT,ANY,BOOTS,Dash Saver,1,,"{""tag"":""dash_sta_cost_flat"",""value"":-1}",,,,"{""STR_pct"":-3}", 
31006,OUTFIT,ANY,BOOTS,Whiff Hunter,1,,"{""tag"":""backstep_speed_pct"",""value"":4}",,,,"{""STA_pct"":-2}", 
31007,OUTFIT,ANY,BOOTS,Grease Soles,1,"{""dash_distance_pct"":6}",,,,,"{""dash_sta_cost_pct"":6}", 
31008,OUTFIT,ANY,BOOTS,Iron Heel,1,,"{""tag"":""knockback_taken_pct"",""value"":-6}",,,,"{""SPD_pct"":-3}", 
31009,OUTFIT,ANY,BOOTS,Slip Counter,1,,"{""tag"":""perfect_block_sta_gain_flat"",""value"":3}",,,,"{""DEF_pct"":-2}", 
31010,OUTFIT,ANY,BOOTS,Sprint Burst,1,,"{""tag"":""mobility_burst"",""value_pct"":8,""durationSec"":2,""staCost"":8,""cooldownSec"":12}",,,,"{}", 
31011,OUTFIT,ANY,BOOTS,Low Profile,1,,"{""tag"":""hurtbox_walk_lowered"",""value"":1}",,,,"{""STR_pct"":-2}", 
31012,OUTFIT,ANY,BOOTS,Step Cancel,1,,"{""tag"":""micro_step_cancel"",""staCost"":6}",,,,"{""DEF_pct"":-2}", 
31013,OUTFIT,ANY,BOOTS,Stamina Tread,1,,"{""tag"":""sta_regen_outside_pressure_pct"",""value"":6}",,,,"{""SPD_pct"":-2}", 
31014,OUTFIT,ANY,BOOTS,Guard Step,1,,"{""tag"":""block_walk_speed_pct"",""value"":6}",,,,"{""STR_pct"":-2}", 
31015,OUTFIT,ANY,BOOTS,Precision Foot,1,,"{""tag"":""input_leniency_pct"",""value"":3}",,,,"{""DEF_pct"":-2}", 
31016,OUTFIT,ANY,BOOTS,Heavy Grip,1,,"{""tag"":""tech_push_resist_pct"",""value"":6}",,,,"{""ground_mobility_pct"":-2}", 
31017,OUTFIT,ANY,BOOTS,Corner Escape,1,,"{""tag"":""backdash_pushback_pct"",""value"":6}",,,,"{""STA_pct"":-2}", 
31018,OUTFIT,ANY,BOOTS,Tempo Boots,1,,"{""tag"":""jab_hit_dash_sta_discount"",""value_flat"":1,""durationSec"":5}",,,,"{""DEF_pct"":-2}", 
31019,OUTFIT,ANY,BOOTS,Anti-Trip,1,,"{""tag"":""sweep_damage_taken_pct"",""value"":-8}",,,,"{""SPD_pct"":-2}", 
31020,OUTFIT,ANY,BOOTS,Duel Boots,1,"{""SPD_pct"":3,""DEF_pct"":2}",,,,,"{""STA_pct"":-2}", 

32001,OUTFIT,ANY,TIGHTS,High Jump Tights,1,"{""jump_height_pct"":10}",,,,,"{""DEF_pct"":-4}", 
32002,OUTFIT,ANY,TIGHTS,Air Control Tights,1,"{""air_control_pct"":12}",,,,,"{""STR_pct"":-3}", 
32003,OUTFIT,ANY,TIGHTS,Short-Hop Master,1,,"{""tag"":""short_hop_consistency"",""value"":1}",,,,"{""ground_mobility_pct"":-2}", 
32004,OUTFIT,ANY,TIGHTS,Landing Soft,1,,"{""tag"":""landing_recovery_frame_bonus"",""value"":1}",,,,"{""STR_pct"":-2}", 
32005,OUTFIT,ANY,TIGHTS,Anti-Air Guard,1,,"{""tag"":""air_damage_taken_pct"",""value"":-8}",,,,"{""ground_mobility_pct"":-2}", 
32006,OUTFIT,ANY,TIGHTS,Second Step,1,,"{""tag"":""double_jump"",""charges"":1,""staCost"":18}",,,,"{""DEF_pct"":-3}", 
32007,OUTFIT,ANY,TIGHTS,Fast Fall,1,,"{""tag"":""fast_fall_control_pct"",""value"":10}",,,,"{""DEF_pct"":-2}", 
32008,OUTFIT,ANY,TIGHTS,Hover Lite,1,,"{""tag"":""micro_hover"",""durationSec"":0.8,""staCost"":12,""cooldownSec"":10}",,,,"{""STR_pct"":-2}", 
32009,OUTFIT,ANY,TIGHTS,Knee Drive,1,,"{""tag"":""jump_attack_reach_pct"",""value"":6}",,,,"{""STA_pct"":-2}", 
32010,OUTFIT,ANY,TIGHTS,Air Brake,1,,"{""tag"":""air_brake"",""staCost"":8}",,,,"{""DEF_pct"":-2}", 
32011,OUTFIT,ANY,TIGHTS,Wall Kick,1,,"{""tag"":""wall_jump"",""charges"":1,""staCost"":15}",,,,"{""STR_pct"":-3}", 
32012,OUTFIT,ANY,TIGHTS,Jump Economy,1,,"{""tag"":""jump_sta_cost_pct"",""value"":-10}",,,,"{""DEF_pct"":-2}", 
32013,OUTFIT,ANY,TIGHTS,Air Tech,1,,"{""tag"":""air_tech_assist"",""value"":1}",,,,"{""STR_pct"":-2}", 
32014,OUTFIT,ANY,TIGHTS,Sky Angles,1,,"{""tag"":""jump_angle_control"",""value"":1}",,,,"{""ground_mobility_pct"":-2}", 
32015,OUTFIT,ANY,TIGHTS,Dive Prep,1,,,"{""tag"":""move_unlock"",""value"":""divekick_light""}",,,,"{""DEF_pct"":-3}", 
32016,OUTFIT,ANY,TIGHTS,Float Control,1,,"{""tag"":""air_time_pct"",""value"":8}",,,,"{""STR_pct"":-2}", 
32017,OUTFIT,ANY,TIGHTS,Anti-Gravity,1,"{""jump_height_pct"":6,""air_control_pct"":6}",,,,,"{""DEF_pct"":-4}", 
32018,OUTFIT,ANY,TIGHTS,Burst Leap,1,,"{""tag"":""burst_leap"",""value"":1,""staCost"":10,""cooldownSec"":12}",,,,"{""DEF_pct"":-2}", 
32019,OUTFIT,ANY,TIGHTS,Air Parry Assist,1,,"{""tag"":""air_parry_window_pct"",""value"":3}",,,,"{""STA_pct"":-2}", 
32020,OUTFIT,ANY,TIGHTS,Acrobat,1,"{""air_mobility_pct"":4,""ground_mobility_pct"":4}",,,,,"{""DEF_pct"":-4}", 

33001,OUTFIT,ANY,SHIRT,Guard Shirt,1,,"{""tag"":""chip_damage_taken_pct"",""value"":-10}",,,,"{""ground_mobility_pct"":-3}", 
33002,OUTFIT,ANY,SHIRT,Stagger Shirt,1,,"{""tag"":""stagger_taken_pct"",""value"":-10}",,,,"{""sta_regen_pct"":-6}", 
33003,OUTFIT,ANY,SHIRT,Pressure Shirt,1,,"{""tag"":""block_sta_cost_pct"",""value"":-8}",,,,"{""throw_damage_taken_pct"":3}", 
33004,OUTFIT,ANY,SHIRT,Recovery Shirt,1,,"{""tag"":""sta_regen_outside_pressure_pct"",""value"":10}",,,,"{""DEF_pct"":-3}", 
33005,OUTFIT,ANY,SHIRT,Fortified Tee,1,"{""DEF_pct"":6}",,,,,"{""SPD_pct"":-3}", 
33006,OUTFIT,ANY,SHIRT,Anti-Burst,1,,"{""tag"":""long_string_damage_taken_pct"",""value"":-8}",,,,"{""STR_pct"":-2}", 
33007,OUTFIT,ANY,SHIRT,Grapple Padding,1,,"{""tag"":""throw_damage_taken_pct"",""value"":-10}",,,,"{""STR_pct"":-2}", 
33008,OUTFIT,ANY,SHIRT,Stoic,1,,"{""tag"":""block_pushback_taken_pct"",""value"":-8}",,,,"{""SPD_pct"":-2}", 
33009,OUTFIT,ANY,SHIRT,Guard Break Resist,1,,"{""tag"":""guard_meter_pct"",""value"":8}",,,,"{""STR_pct"":-2}", 
33010,OUTFIT,ANY,SHIRT,Calm Breath,1,,"{""tag"":""idle_sta_gain_flat"",""value"":6,""afterSec"":2}",,,,"{""DEF_pct"":-2}", 
33011,OUTFIT,ANY,SHIRT,Chip Convert,1,,"{""tag"":""chip_to_sta_convert_pct"",""value"":30}",,,,"{""STR_pct"":-3}", 
33012,OUTFIT,ANY,SHIRT,Pain Tolerance,1,,"{""tag"":""damage_taken_pct"",""value"":-6}",,,,"{""cancel_sta_cost_pct"":4}", 
33013,OUTFIT,ANY,SHIRT,Anti-Air Plate,1,,"{""tag"":""air_damage_taken_pct"",""value"":-8}",,,,"{""SPD_pct"":-2}", 
33014,OUTFIT,ANY,SHIRT,Frame Stable,1,,"{""tag"":""whiff_penalty_pct"",""value"":-6}",,,,"{""STR_pct"":-2}", 
33015,OUTFIT,ANY,SHIRT,Cleanse Cloth,1,,"{""tag"":""debuff_duration_pct"",""value"":-20}",,,,"{""DEF_pct"":-2}", 
33016,OUTFIT,ANY,SHIRT,Heavy Weave,1,"{""DEF_pct"":8}",,,,,"{""SPD_pct"":-5}", 
33017,OUTFIT,ANY,SHIRT,Counter Guard,1,,"{""tag"":""perfect_block_next_hit_damage_pct"",""value"":2,""durationSec"":5}",,,,"{""STA_pct"":-2}", 
33018,OUTFIT,ANY,SHIRT,Stamina Shield,1,,"{""tag"":""block_sta_cost_pct"",""value"":-10}",,,,"{""SPD_pct"":-3}", 
33019,OUTFIT,ANY,SHIRT,Tempo Armor,1,,"{""tag"":""soft_armor_vs_jab"",""cooldownSec"":20}",,,,"{""STR_pct"":-3}", 
33020,OUTFIT,ANY,SHIRT,Duel Shirt,1,"{""DEF_pct"":3,""STA_pct"":3}",,,,,"{""SPD_pct"":-3}", 

34001,OUTFIT,ANY,CAPE,Glide Cape,1,,"{""tag"":""glide"",""durationSec"":2,""staCost"":12,""cooldownSec"":10}",,,,"{""cannot_attack_while_active"":1}", 
34002,OUTFIT,ANY,CAPE,Air Dash Cape,1,,"{""tag"":""air_dash_extra"",""charges"":1,""durationSec"":5,""staCost"":15,""cooldownSec"":10}",,,,"{""DEF_pct"":-2}", 
34003,OUTFIT,ANY,CAPE,Hover Cape,50,,"{""tag"":""hover"",""durationSec"":3,""staCost"":30,""cooldownSec"":45}",,,,"{""vulnerable_to_anti_air"":1}", 
34004,OUTFIT,ANY,CAPE,Dive Cape,1,,,"{""tag"":""move_unlock"",""value"":""divekick_light""}",,,,"{""DEF_pct"":-4}", 
34005,OUTFIT,ANY,CAPE,Updraft,1,,"{""tag"":""mini_lift"",""durationSec"":1,""staCost"":18,""cooldownSec"":14}",,,,"{""STR_pct"":-2}", 
34006,OUTFIT,ANY,CAPE,Feather Back,1,"{""air_control_pct"":8}",,,,,"{""DEF_pct"":-2}", 
34007,OUTFIT,ANY,CAPE,Anti-Air Cloak,1,,"{""tag"":""air_damage_taken_pct"",""value"":-8}",,,,"{""STR_pct"":-2}", 
34008,OUTFIT,ANY,CAPE,Wing Breaker,1,"{""air_dash_distance_pct"":8}",,,,,"{""air_dash_sta_cost_flat"":5}", 
34009,OUTFIT,ANY,CAPE,Air Feint,1,,"{""tag"":""air_feint"",""staCost"":10}",,,,"{""DEF_pct"":-2}", 
34010,OUTFIT,ANY,CAPE,Sky Seal,1,,"{""tag"":""air_dash_deny_on_read"",""cooldownSec"":30}",,,,"{""STR_pct"":-3}", 
34011,OUTFIT,ANY,CAPE,Float Cancel,1,,"{""tag"":""landing_cancel"",""staCost"":12}",,,,"{""DEF_pct"":-2}", 
34012,OUTFIT,ANY,CAPE,Cloud Step,1,,"{""tag"":""air_step"",""charges"":1,""staCost"":20,""cooldownSec"":16}",,,,"{""sta_regen_pct"":-2}", 
34013,OUTFIT,ANY,CAPE,Drift Cape,1,"{""air_drift_pct"":10}",,,,,"{""STR_pct"":-2}", 
34014,OUTFIT,ANY,CAPE,Wind Guard,1,,"{""tag"":""air_chip_damage_taken_pct"",""value"":-10}",,,,"{""DEF_pct"":-2}", 
34015,OUTFIT,ANY,CAPE,Jet Burst,1,,"{""tag"":""air_burst"",""staCost"":18,""cooldownSec"":20}",,,,"{""DEF_pct"":-3}", 
34016,OUTFIT,ANY,CAPE,Slow Fall,1,,"{""tag"":""slow_fall"",""durationSec"":3}",,,,"{""STR_pct"":-2}", 
34017,OUTFIT,ANY,CAPE,Air Counter,1,,"{""tag"":""air_counter"",""staCost"":12}",,,,"{""whiff_penalty"":1}", 
34018,OUTFIT,ANY,CAPE,Flight Cape,50,,"{""tag"":""flight"",""durationSec"":4,""staCost"":35,""cooldownSec"":60}",,,,"{""cannot_block_while_active"":1}", 
34019,OUTFIT,ANY,CAPE,Phantom Cape,1,,"{""tag"":""intent_mask"",""durationSec"":2,""staCost"":20,""cooldownSec"":35}",,,,"{""DEF_pct"":-2}", 
34020,OUTFIT,ANY,CAPE,Duel Cape,1,"{""air_mobility_pct"":6,""ground_mobility_pct"":4}",,,,,"{""DEF_pct"":-4}", 

4) Versionado (para temporadas y parches)

Recomendación:

catalog.v1.json / catalog.v1.csv no se edita (inmutable)

Cambios van en catalog.v1.0.1.json o catalog.v2.json

En-chain, GameCore puede tener catalogVersionHash (opcional) para asegurar que server+client usan lo mismo.

5) Nota práctica (importante)

En el contrato, no necesitas guardar todos estos parámetros complejos (mods, cooldowns) on-chain.
Lo mínimo on-chain para validar es:

tipo/slot

tier

minLevel (solo para power y quizá hover/flight)

El resto (mods exactos, stamina cost exacto, etc.) puede vivir off-chain en este catálogo y en el motor del juego, mientras los caps globales y el loadoutHash mantengan consistencia competitiva.

Si quieres, lo siguiente que te acelera muchísimo es que te dé:

un esquema TypeScript (types.ts) para parsear estos JSON/CSV,

y una lista de constantes (ItemIds.ts) para que el cliente no use números “mágicos”.
Perfecto. Abajo tienes 3 archivos TypeScript listos para tu repo:


src/catalog/types.ts → tipos + helpers


src/catalog/loadCatalog.ts → cargar JSON/CSV e indexar


src/catalog/ItemIds.ts → constantes de IDs (parches + outfit)



Todo va en code blocks para que copies/pegues tal cual.


src/catalog/types.ts
// src/catalog/types.ts

export type VersionString = `v${number}.${number}.${number}`;

/** Tier de máscara/parche (outfit puede ser ANY) */
export enum Tier {
  COMMON = "COMMON",
  RARE = "RARE",
  LEGENDARY = "LEGENDARY",
  ANY = "ANY",
}

/** Slots de parches */
export enum PatchSlot {
  TRAIT = "TRAIT",
  MOVES = "MOVES",
  POWER = "POWER",
}

/** Slots de outfit */
export enum OutfitSlot {
  BOOTS = "BOOTS",
  TIGHTS = "TIGHTS",
  SHIRT = "SHIRT",
  CAPE = "CAPE",
}

export enum ItemType {
  PATCH = "PATCH",
  OUTFIT = "OUTFIT",
}

export type JsonObject = Record<string, unknown>;

/** Campos opcionales comunes */
export interface ItemBase {
  id: number;
  type: ItemType;
  tier: Tier; // OUTFIT usa Tier.ANY
  slot: PatchSlot | OutfitSlot;
  name: string;
  minLevel: number;
  mods?: Record<string, number>;      // e.g. { STR_pct: 8, DEF_pct: -4 }
  ability?: JsonObject;               // e.g. { tag: "dot", durationSec: 6, ... }
  kit?: JsonObject;                   // e.g. { tag: "move_unlock", value: "parry_strict" }
  costs?: JsonObject;                 // e.g. { stamina: 30 }
  cooldowns?: JsonObject;             // e.g. { sec: 45 }
  tradeoffs?: JsonObject;             // e.g. { DEF_pct: -2 }
  counterplay?: string[];             // e.g. ["spacing","cleanse"]
}

/** Discriminated unions */
export interface PatchItem extends ItemBase {
  type: ItemType.PATCH;
  slot: PatchSlot;
  tier: Tier.COMMON | Tier.RARE | Tier.LEGENDARY;
}

export interface OutfitItem extends ItemBase {
  type: ItemType.OUTFIT;
  slot: OutfitSlot;
  tier: Tier.ANY;
}

export type CatalogItem = PatchItem | OutfitItem;

export interface CatalogFile {
  version: VersionString;
  idRanges: Record<string, [number, number]>;
  items: CatalogItem[];
}

/** Type guards */
export const isPatch = (x: CatalogItem): x is PatchItem => x.type === ItemType.PATCH;
export const isOutfit = (x: CatalogItem): x is OutfitItem => x.type === ItemType.OUTFIT;

/** Helpers */
export function assertNever(_x: never): never {
  throw new Error("Unexpected object in discriminated union");
}

export function itemKey(item: CatalogItem): string {
  return `${item.type}:${item.slot}:${item.id}`;
}

/** Canonical rule helpers (UI + server) */
export const RULES = {
  COMMON_TRAIT_MIN_LEVEL: 8,
  POWER_MIN_LEVEL: 50,
} as const;

/**
 * Nota: Esto NO reemplaza la validación del contrato.
 * Es helper para UI/servidor.
 */
export function canUsePatchSlot(params: {
  playerLevel: number;
  maskTier: Tier.COMMON | Tier.RARE | Tier.LEGENDARY;
  patchSlot: PatchSlot;
}): boolean {
  const { playerLevel, maskTier, patchSlot } = params;

  if (maskTier === Tier.COMMON) {
    return patchSlot === PatchSlot.TRAIT && playerLevel >= RULES.COMMON_TRAIT_MIN_LEVEL;
  }
  if (maskTier === Tier.RARE) {
    return patchSlot === PatchSlot.TRAIT || patchSlot === PatchSlot.MOVES;
  }
  // LEGENDARY
  if (patchSlot === PatchSlot.POWER) return playerLevel >= RULES.POWER_MIN_LEVEL;
  return patchSlot === PatchSlot.TRAIT || patchSlot === PatchSlot.MOVES;
}


src/catalog/loadCatalog.ts
// src/catalog/loadCatalog.ts
import fs from "node:fs";
import path from "node:path";
import {
  CatalogFile,
  CatalogItem,
  ItemType,
  PatchSlot,
  OutfitSlot,
  Tier,
} from "./types";

/**
 * Carga el JSON oficial (catalog.v1.json) y construye índices útiles.
 */
export function loadCatalogFromJson(filePath: string): CatalogFile {
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw) as CatalogFile;

  // Validaciones mínimas (mantener simple)
  if (!data.version || !data.items || !Array.isArray(data.items)) {
    throw new Error("Catalog JSON inválido: faltan campos básicos");
  }
  return data;
}

export interface CatalogIndex {
  byId: Map<number, CatalogItem>;
  patches: CatalogItem[];
  outfits: CatalogItem[];
  byTypeSlot: Map<string, CatalogItem[]>;
}

export function buildIndex(catalog: CatalogFile): CatalogIndex {
  const byId = new Map<number, CatalogItem>();
  const patches: CatalogItem[] = [];
  const outfits: CatalogItem[] = [];
  const byTypeSlot = new Map<string, CatalogItem[]>();

  for (const item of catalog.items) {
    if (byId.has(item.id)) {
      throw new Error(`ID duplicado en catálogo: ${item.id}`);
    }
    byId.set(item.id, item);

    const key = `${item.type}:${item.slot}`;
    const arr = byTypeSlot.get(key) ?? [];
    arr.push(item);
    byTypeSlot.set(key, arr);

    if (item.type === ItemType.PATCH) patches.push(item);
    if (item.type === ItemType.OUTFIT) outfits.push(item);
  }

  return { byId, patches, outfits, byTypeSlot };
}

/**
 * (Opcional) CSV parser simple: espera el CSV con columnas *_json como strings JSON.
 * Útil si decides mantener catálogo como CSV y generar JSON en build-time.
 */
export function loadItemsFromCsv(csvPath: string): CatalogItem[] {
  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);

  // header
  const header = lines.shift();
  if (!header) return [];
  const cols = header.split(",");

  const idx = (name: string) => {
    const i = cols.indexOf(name);
    if (i === -1) throw new Error(`CSV: falta columna ${name}`);
    return i;
  };

  const get = (row: string[], name: string) => row[idx(name)] ?? "";

  const parseJsonCell = (s: string): any => {
    const t = (s ?? "").trim();
    if (!t) return undefined;
    try {
      return JSON.parse(t);
    } catch {
      // si viene como ""{...}"" por CSV, intentamos des-escapar
      const unquoted = t.replace(/^"+|"+$/g, "").replace(/""/g, '"');
      return JSON.parse(unquoted);
    }
  };

  const items: CatalogItem[] = [];
  for (const line of lines) {
    const row = splitCsvLine(line);

    const id = Number(get(row, "id"));
    const type = get(row, "type") as ItemType;
    const tier = get(row, "tier") as Tier;
    const slot = get(row, "slot") as PatchSlot | OutfitSlot;
    const name = get(row, "name");
    const minLevel = Number(get(row, "minLevel"));

    const mods = parseJsonCell(get(row, "mods_json"));
    const ability = parseJsonCell(get(row, "ability_json"));
    const kit = parseJsonCell(get(row, "kit_json"));
    const costs = parseJsonCell(get(row, "costs_json"));
    const cooldowns = parseJsonCell(get(row, "cooldowns_json"));
    const tradeoffs = parseJsonCell(get(row, "tradeoffs_json"));
    const counterplay = parseJsonCell(get(row, "counterplay_json"));

    const item: CatalogItem = {
      id,
      type,
      tier,
      slot,
      name,
      minLevel,
      ...(mods ? { mods } : {}),
      ...(ability ? { ability } : {}),
      ...(kit ? { kit } : {}),
      ...(costs ? { costs } : {}),
      ...(cooldowns ? { cooldowns } : {}),
      ...(tradeoffs ? { tradeoffs } : {}),
      ...(counterplay ? { counterplay } : {}),
    } as CatalogItem;

    items.push(item);
  }
  return items;
}

/** CSV splitter simple que respeta comillas */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && line[i + 1] === '"') {
      cur += '"';
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}


src/catalog/ItemIds.ts (constantes oficiales)
// src/catalog/ItemIds.ts
// Constantes oficiales (v1). Mantén este archivo INMUTABLE por versión.

export const IDS = {
  PATCH: {
    COMMON_TRAIT: {
      LIGERO: 11001,
      BRUTO: 11002,
      MURALLA: 11003,
      CARDIO: 11004,
      REACCION: 11005,
      IMPACTO: 11006,
      TEMPLADO: 11007,
      RECUPERACION: 11008,
      CENTRO_DE_GRAVEDAD: 11009,
      AGARRE_FIRME: 11010,
    },
    RARE_TRAIT: {
      ATLETA: 12001,
      DEMOLEDOR: 12002,
      ARMADURA: 12003,
      PULMON_DE_ACERO: 12004,
      PRECISION: 12005,
      CONTRAATAQUE: 12006,
      PIE_FIRME: 12007,
      EXPLOSIVO: 12008,
      EVASIVO: 12009,
      DISCIPLINA: 12010,
    },
    RARE_MOVES: {
      COBRA_STRING: 13001,
      UPPERCUT_CANCEL: 13002,
      LOW_SWEEP: 13003,
      GUARD_BREAKER: 13004,
      THROW_EXTENSION: 13005,
      BACKSTEP_STRIKE: 13006,
      PARRY_WINDOW: 13007,
      AIR_STARTER: 13008,
      WALL_BOUNCE: 13009,
      LARIAT_FINISHER: 13010,
    },
    LEGENDARY_TRAIT: {
      FURIA_CONTROLADA: 21001,
      SOMBRA_VELOZ: 21002,
      BASTION: 21003,
      MOTOR_ETERNO: 21004,
      ASESINO_TECNICO: 21005,
      GLADIADOR: 21006,
      DUELISTA: 21007,
      HIERRO_VIVO: 21008,
      MAESTRIA: 21009,
      INSTINTO: 21010,
    },
    LEGENDARY_MOVES: {
      JAGUAR_ROUTES: 22001,
      HEAVY_LAUNCHER: 22002,
      FEINT_SYSTEM: 22003,
      COMMAND_GRAB: 22004,
      ARMOR_MOVE: 22005,
      WAKEUP_REVERSAL: 22006,
      TELEPORT_STEP: 22007,
      CORNER_TRAP: 22008,
      AIR_FINISHER: 22009,
      STANCE_CHANGE: 22010,
    },
    LEGENDARY_POWER: {
      FUEGO_QUEMADURA: 23001,
      AIRE_AIRDASH_EXTRA: 23002,
      TIERRA_ESCUDO: 23003,
      AGUA_CURACION: 23004,
      RAYO_MICRO_STUN: 23005,
      SOMBRA_OCULTAR_INTENCION: 23006,
      MAGIA_SILENCIO: 23007,
      LUZ_PURIFICAR: 23008,
      HIELO_SLOW: 23009,
      SANGRE_BERSERK: 23010,
    },
  },

  OUTFIT: {
    BOOTS: {
      SPRINTER_BOOTS: 31001,
      ANCHOR_BOOTS: 31002,
      FEINT_BOOTS: 31003,
      PIVOT_BOOTS: 31004,
      DASH_SAVER: 31005,
      WHIFF_HUNTER: 31006,
      GREASE_SOLES: 31007,
      IRON_HEEL: 31008,
      SLIP_COUNTER: 31009,
      SPRINT_BURST: 31010,
      LOW_PROFILE: 31011,
      STEP_CANCEL: 31012,
      STAMINA_TREAD: 31013,
      GUARD_STEP: 31014,
      PRECISION_FOOT: 31015,
      HEAVY_GRIP: 31016,
      CORNER_ESCAPE: 31017,
      TEMPO_BOOTS: 31018,
      ANTI_TRIP: 31019,
      DUEL_BOOTS: 31020,
    },
    TIGHTS: {
      HIGH_JUMP_TIGHTS: 32001,
      AIR_CONTROL_TIGHTS: 32002,
      SHORT_HOP_MASTER: 32003,
      LANDING_SOFT: 32004,
      ANTI_AIR_GUARD: 32005,
      SECOND_STEP: 32006,
      FAST_FALL: 32007,
      HOVER_LITE: 32008,
      KNEE_DRIVE: 32009,
      AIR_BRAKE: 32010,
      WALL_KICK: 32011,
      JUMP_ECONOMY: 32012,
      AIR_TECH: 32013,
      SKY_ANGLES: 32014,
      DIVE_PREP: 32015,
      FLOAT_CONTROL: 32016,
      ANTI_GRAVITY: 32017,
      BURST_LEAP: 32018,
      AIR_PARRY_ASSIST: 32019,
      ACROBAT: 32020,
    },
    SHIRT: {
      GUARD_SHIRT: 33001,
      STAGGER_SHIRT: 33002,
      PRESSURE_SHIRT: 33003,
      RECOVERY_SHIRT: 33004,
      FORTIFIED_TEE: 33005,
      ANTI_BURST: 33006,
      GRAPPLE_PADDING: 33007,
      STOIC: 33008,
      GUARD_BREAK_RESIST: 33009,
      CALM_BREATH: 33010,
      CHIP_CONVERT: 33011,
      PAIN_TOLERANCE: 33012,
      ANTI_AIR_PLATE: 33013,
      FRAME_STABLE: 33014,
      CLEANSE_CLOTH: 33015,
      HEAVY_WEAVE: 33016,
      COUNTER_GUARD: 33017,
      STAMINA_SHIELD: 33018,
      TEMPO_ARMOR: 33019,
      DUEL_SHIRT: 33020,
    },
    CAPE: {
      GLIDE_CAPE: 34001,
      AIR_DASH_CAPE: 34002,
      HOVER_CAPE: 34003,
      DIVE_CAPE: 34004,
      UPDRAFT: 34005,
      FEATHER_BACK: 34006,
      ANTI_AIR_CLOAK: 34007,
      WING_BREAKER: 34008,
      AIR_FEINT: 34009,
      SKY_SEAL: 34010,
      FLOAT_CANCEL: 34011,
      CLOUD_STEP: 34012,
      DRIFT_CAPE: 34013,
      WIND_GUARD: 34014,
      JET_BURST: 34015,
      SLOW_FALL: 34016,
      AIR_COUNTER: 34017,
      FLIGHT_CAPE: 34018,
      PHANTOM_CAPE: 34019,
      DUEL_CAPE: 34020,
    },
  },
} as const;

/** Arrays útiles para iterar en UI/validaciones */
export const PATCH_IDS_ALL: number[] = [
  ...Object.values(IDS.PATCH.COMMON_TRAIT),
  ...Object.values(IDS.PATCH.RARE_TRAIT),
  ...Object.values(IDS.PATCH.RARE_MOVES),
  ...Object.values(IDS.PATCH.LEGENDARY_TRAIT),
  ...Object.values(IDS.PATCH.LEGENDARY_MOVES),
  ...Object.values(IDS.PATCH.LEGENDARY_POWER),
];

export const OUTFIT_IDS_ALL: number[] = [
  ...Object.values(IDS.OUTFIT.BOOTS),
  ...Object.values(IDS.OUTFIT.TIGHTS),
  ...Object.values(IDS.OUTFIT.SHIRT),
  ...Object.values(IDS.OUTFIT.CAPE),
];

export const ALL_ITEM_IDS: number[] = [...PATCH_IDS_ALL, ...OUTFIT_IDS_ALL];


Siguiente paso recomendado (rápido)
Si quieres, te hago un scripts/generateItemIds.ts que lea catalog.v1.json y genere automáticamente ItemIds.ts (así nunca lo escribes a mano cuando agregues v2).

Aquí tienes validateCatalog.ts (valida estructura + rangos + duplicados + reglas de nivel + límites/caps por item) y además un validateBuild.ts (valida un loadout completo contra caps globales). Con esto evitas meter contenido roto a producción.

scripts/validateCatalog.ts
// scripts/validateCatalog.ts
/**
 * Valida:
 * - JSON schema mínimo
 * - IDs duplicados
 * - IDs dentro de rangos declarados (si existe idRanges)
 * - reglas de nivel (POWER>=50, etc.)
 * - caps por item (movilidad/defensa/daño/sta)
 *
 * Uso:
 *   npx tsx scripts/validateCatalog.ts data/catalog.v1.json
 */

import fs from "node:fs";

type Tier = "COMMON" | "RARE" | "LEGENDARY" | "ANY";
type ItemType = "PATCH" | "OUTFIT";
type PatchSlot = "TRAIT" | "MOVES" | "POWER";
type OutfitSlot = "BOOTS" | "TIGHTS" | "SHIRT" | "CAPE";
type Slot = PatchSlot | OutfitSlot;

type CatalogItem = {
  id: number;
  type: ItemType;
  tier: Tier;
  slot: Slot;
  name: string;
  minLevel: number;
  mods?: Record<string, number>;
  ability?: Record<string, any>;
  kit?: Record<string, any>;
  costs?: Record<string, any>;
  cooldowns?: Record<string, any>;
  tradeoffs?: Record<string, any>;
  counterplay?: string[];
};

type CatalogFile = {
  version: string;
  idRanges?: Record<string, [number, number]>;
  items: CatalogItem[];
};

const RULES = {
  POWER_MIN_LEVEL: 50,
  COMMON_TRAIT_MIN_LEVEL_UI: 8, // UI hint (la regla real depende de máscara)
} as const;

/** Caps por item (no globales) — evita que un solo item rompa el juego */
const ITEM_CAPS = {
  // ground mobility: boots + algunas cosas; cada item individual debe estar <= 10
  ground_mobility_pct_max: 10,
  air_mobility_pct_max: 12,
  air_control_pct_max: 12,
  jump_height_pct_max: 12,
  STR_pct_max: 12,
  DEF_pct_max: 12,
  STA_pct_max: 12,
  SPD_pct_max: 12,
  // algunos tags controlados
  dash_recovery_frame_bonus_max: 1, // -1 frame max
  landing_recovery_frame_bonus_max: 1,
  // stamina discounts
  sta_cost_pct_abs_max: 15,
} as const;

function die(msg: string): never {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

function warn(msg: string) {
  console.warn(`⚠️  ${msg}`);
}

function readJson(filePath: string): CatalogFile {
  if (!fs.existsSync(filePath)) die(`No existe el archivo: ${filePath}`);
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw) as CatalogFile;
  if (!data || !Array.isArray(data.items)) die("Catálogo inválido: falta items[]");
  if (!data.version) die("Catálogo inválido: falta version");
  return data;
}

function inRange(id: number, range: [number, number]) {
  return id >= range[0] && id <= range[1];
}

function getDeclaredRangeKey(item: CatalogItem): string | null {
  // Convención de rangos por tipo/tier/slot (si el JSON declara idRanges con esas keys)
  if (item.type === "PATCH") {
    if (item.tier === "COMMON" && item.slot === "TRAIT") return "patch_common_trait";
    if (item.tier === "RARE" && item.slot === "TRAIT") return "patch_rare_trait";
    if (item.tier === "RARE" && item.slot === "MOVES") return "patch_rare_moves";
    if (item.tier === "LEGENDARY" && item.slot === "TRAIT") return "patch_legendary_trait";
    if (item.tier === "LEGENDARY" && item.slot === "MOVES") return "patch_legendary_moves";
    if (item.tier === "LEGENDARY" && item.slot === "POWER") return "patch_legendary_power";
  } else {
    if (item.slot === "BOOTS") return "outfit_boots";
    if (item.slot === "TIGHTS") return "outfit_tights";
    if (item.slot === "SHIRT") return "outfit_shirt";
    if (item.slot === "CAPE") return "outfit_cape";
  }
  return null;
}

function validateItemBasics(item: CatalogItem) {
  if (!Number.isFinite(item.id)) die(`ID inválido: ${item.id}`);
  if (!item.type || !item.tier || !item.slot || !item.name) die(`Item incompleto: id=${item.id}`);
  if (!Number.isFinite(item.minLevel)) die(`minLevel inválido: id=${item.id}`);

  if (item.type === "PATCH") {
    if (!["COMMON", "RARE", "LEGENDARY"].includes(item.tier)) die(`Patch tier inválido: id=${item.id}`);
    if (!["TRAIT", "MOVES", "POWER"].includes(item.slot)) die(`Patch slot inválido: id=${item.id}`);
    if (item.tier !== "LEGENDARY" && item.slot === "POWER") die(`POWER solo puede ser LEGENDARY: id=${item.id}`);
  } else {
    if (item.tier !== "ANY") die(`Outfit tier debe ser ANY: id=${item.id}`);
    if (!["BOOTS", "TIGHTS", "SHIRT", "CAPE"].includes(item.slot)) die(`Outfit slot inválido: id=${item.id}`);
  }

  // Reglas de nivel
  if (item.type === "PATCH" && item.slot === "POWER" && item.minLevel < RULES.POWER_MIN_LEVEL) {
    die(`Power minLevel debe ser >=${RULES.POWER_MIN_LEVEL}: id=${item.id}`);
  }

  // UI hint: common trait minLevel >= 8 (opcional, es solo UI)
  if (item.type === "PATCH" && item.tier === "COMMON" && item.slot === "TRAIT" && item.minLevel < RULES.COMMON_TRAIT_MIN_LEVEL_UI) {
    warn(`Common Trait con minLevel < 8 (UI): id=${item.id} (esto puede confundir en UI)`);
  }
}

function validateCapsPerItem(item: CatalogItem) {
  // Mods numéricos controlados
  const mods = item.mods ?? {};
  const maxByKey: Record<string, number> = {
    ground_mobility_pct: ITEM_CAPS.ground_mobility_pct_max,
    air_mobility_pct: ITEM_CAPS.air_mobility_pct_max,
    air_control_pct: ITEM_CAPS.air_control_pct_max,
    jump_height_pct: ITEM_CAPS.jump_height_pct_max,
    STR_pct: ITEM_CAPS.STR_pct_max,
    DEF_pct: ITEM_CAPS.DEF_pct_max,
    STA_pct: ITEM_CAPS.STA_pct_max,
    SPD_pct: ITEM_CAPS.SPD_pct_max,
    dash_distance_pct: ITEM_CAPS.ground_mobility_pct_max,
    air_drift_pct: ITEM_CAPS.air_mobility_pct_max,
    air_dash_distance_pct: ITEM_CAPS.air_mobility_pct_max,
  };

  for (const [k, v] of Object.entries(mods)) {
    const cap = maxByKey[k];
    if (cap !== undefined && Math.abs(v) > cap) {
      die(`Cap por item excedido: id=${item.id} mods.${k}=${v} (cap abs=${cap})`);
    }
  }

  // ability tags controlados
  const a = item.ability ?? {};
  const tag = a.tag;

  if (tag === "dash_recovery_frame_bonus" || tag === "landing_recovery_frame_bonus") {
    const val = Number(a.value ?? 0);
    const cap = tag === "dash_recovery_frame_bonus"
      ? ITEM_CAPS.dash_recovery_frame_bonus_max
      : ITEM_CAPS.landing_recovery_frame_bonus_max;
    if (Math.abs(val) > cap) die(`Frame bonus demasiado alto: id=${item.id} ${tag}=${val} cap=${cap}`);
  }

  // stamina cost percent tags
  const pctTags = new Set([
    "moves_sta_cost_pct",
    "block_sta_cost_pct",
    "jump_sta_cost_pct",
    "feint_sta_cost_pct",
    "cancel_sta_cost_pct",
    "sta_regen_pct",
    "sta_regen_outside_pressure_pct",
  ]);
  if (typeof tag === "string" && pctTags.has(tag)) {
    const val = Number(a.value ?? 0);
    if (Math.abs(val) > ITEM_CAPS.sta_cost_pct_abs_max) {
      die(`Cambio % STA demasiado alto: id=${item.id} tag=${tag} value=${val} capAbs=${ITEM_CAPS.sta_cost_pct_abs_max}`);
    }
  }
}

function main() {
  const [, , filePath] = process.argv;
  if (!filePath) die("Uso: validateCatalog.ts <catalogJsonPath>");

  const catalog = readJson(filePath);
  const ids = new Set<number>();

  for (const item of catalog.items) {
    validateItemBasics(item);

    if (ids.has(item.id)) die(`ID duplicado: ${item.id}`);
    ids.add(item.id);

    // Rangos declarados
    if (catalog.idRanges) {
      const key = getDeclaredRangeKey(item);
      if (key && catalog.idRanges[key]) {
        if (!inRange(item.id, catalog.idRanges[key])) {
          die(`ID fuera de rango: id=${item.id} key=${key} range=${catalog.idRanges[key][0]}-${catalog.idRanges[key][1]}`);
        }
      } else {
        warn(`No hay idRange declarado para item id=${item.id} (key=${key ?? "null"})`);
      }
    }

    validateCapsPerItem(item);
  }

  console.log(`✅ OK: catálogo válido. version=${catalog.version}, items=${catalog.items.length}`);
}

main();

scripts/validateBuild.ts (valida un loadout completo contra caps globales)
// scripts/validateBuild.ts
/**
 * Valida un loadout COMPLETO contra caps globales.
 * Esto se usa en el servidor (matchmaking / ranked) y en UI para warnings.
 *
 * Uso (ejemplo):
 *   npx tsx scripts/validateBuild.ts data/catalog.v1.json '{"maskTier":"LEGENDARY","level":72,"patches":[21001,22003,23002],"outfit":[31001,32002,33001,34002]}'
 */

import fs from "node:fs";

type Tier = "COMMON" | "RARE" | "LEGENDARY" | "ANY";
type ItemType = "PATCH" | "OUTFIT";
type Slot = "TRAIT" | "MOVES" | "POWER" | "BOOTS" | "TIGHTS" | "SHIRT" | "CAPE";

type CatalogItem = {
  id: number;
  type: ItemType;
  tier: Tier;
  slot: Slot;
  name: string;
  minLevel: number;
  mods?: Record<string, number>;
  ability?: Record<string, any>;
  tradeoffs?: Record<string, any>;
};

type CatalogFile = { version: string; items: CatalogItem[] };

const GLOBAL_CAPS = {
  STR_pct_max: 18,
  DEF_effective_pct_max: 15,
  STA_efficiency_pct_abs_max: 15,
  ground_mobility_pct_max: 10,
  air_mobility_pct_max: 12,
} as const;

const RULES = {
  POWER_MIN_LEVEL: 50,
  COMMON_TRAIT_MIN_LEVEL: 8,
} as const;

type BuildInput = {
  maskTier: "COMMON" | "RARE" | "LEGENDARY";
  level: number;
  patches: number[]; // patchIds equipados (0-3)
  outfit: number[];  // [bootsId, tightsId, shirtId, capeId] (0-4, pero recomendado 4)
};

function die(msg: string): never {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

function readCatalog(p: string): CatalogFile {
  if (!fs.existsSync(p)) die(`No existe: ${p}`);
  const raw = fs.readFileSync(p, "utf8");
  const c = JSON.parse(raw) as CatalogFile;
  if (!c || !Array.isArray(c.items)) die("Catálogo inválido");
  return c;
}

function buildIndex(c: CatalogFile): Map<number, CatalogItem> {
  const m = new Map<number, CatalogItem>();
  for (const it of c.items) {
    if (m.has(it.id)) die(`ID duplicado en catálogo: ${it.id}`);
    m.set(it.id, it);
  }
  return m;
}

function canUsePatch(level: number, maskTier: BuildInput["maskTier"], patch: CatalogItem): boolean {
  if (patch.type !== "PATCH") return false;

  // tier lock de parche con máscara
  if (patch.tier !== maskTier) return false;

  // slot rules
  if (maskTier === "COMMON") {
    if (patch.slot !== "TRAIT") return false;
    return level >= RULES.COMMON_TRAIT_MIN_LEVEL;
  }
  if (maskTier === "RARE") {
    return patch.slot === "TRAIT" || patch.slot === "MOVES";
  }
  // LEGENDARY
  if (patch.slot === "POWER") return level >= RULES.POWER_MIN_LEVEL;
  return patch.slot === "TRAIT" || patch.slot === "MOVES";
}

function sumMods(items: CatalogItem[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const it of items) {
    const mods = it.mods ?? {};
    for (const [k, v] of Object.entries(mods)) {
      out[k] = (out[k] ?? 0) + Number(v);
    }
    // tradeoffs también suman (son mods negativos/condiciones)
    const t = it.tradeoffs ?? {};
    for (const [k, v] of Object.entries(t)) {
      if (typeof v === "number") out[k] = (out[k] ?? 0) + v;
    }
  }
  return out;
}

function clampCheck(value: number, capAbs: number, label: string) {
  if (Math.abs(value) > capAbs) {
    die(`Cap global excedido: ${label}=${value} (capAbs=${capAbs})`);
  }
}

function main() {
  const [, , catalogPath, buildJson] = process.argv;
  if (!catalogPath || !buildJson) {
    die("Uso: validateBuild.ts <catalogJsonPath> <buildJsonString>");
  }

  const catalog = readCatalog(catalogPath);
  const index = buildIndex(catalog);

  const build = JSON.parse(buildJson) as BuildInput;
  if (!build || !build.maskTier || !Number.isFinite(build.level)) die("Build inválido");
  const level = build.level;

  const patchItems: CatalogItem[] = [];
  const patchSeen = new Set<number>();
  for (const id of build.patches ?? []) {
    if (!id) continue;
    if (patchSeen.has(id)) die(`Parche repetido en build: ${id}`);
    patchSeen.add(id);

    const it = index.get(id);
    if (!it) die(`Patch ID no existe: ${id}`);
    if (it.type !== "PATCH") die(`ID no es patch: ${id}`);
    if (!canUsePatch(level, build.maskTier, it)) die(`Patch no permitido por reglas: ${id} (${it.name})`);
    patchItems.push(it);
  }

  const outfitItems: CatalogItem[] = [];
  for (const id of build.outfit ?? []) {
    if (!id) continue;
    const it = index.get(id);
    if (!it) die(`Outfit ID no existe: ${id}`);
    if (it.type !== "OUTFIT") die(`ID no es outfit: ${id}`);
    if (level < it.minLevel) die(`Outfit requiere nivel ${it.minLevel}: ${id} (${it.name})`);
    outfitItems.push(it);
  }

  const all = [...patchItems, ...outfitItems];
  const mods = sumMods(all);

  // Interpretación simple de caps globales en base a mods agregados.
  const str = mods["STR_pct"] ?? 0;
  const def = mods["DEF_pct"] ?? 0;
  const sta = mods["STA_pct"] ?? 0;
  const spd = mods["SPD_pct"] ?? 0;

  const groundMob = (mods["ground_mobility_pct"] ?? 0) + (mods["dash_distance_pct"] ?? 0);
  const airMob = (mods["air_mobility_pct"] ?? 0) + (mods["air_drift_pct"] ?? 0) + (mods["air_dash_distance_pct"] ?? 0);

  // Caps globales: STR y movilidad (los más críticos)
  clampCheck(str, GLOBAL_CAPS.STR_pct_max, "STR_pct_total");
  clampCheck(def, GLOBAL_CAPS.DEF_effective_pct_max, "DEF_pct_total");
  clampCheck(groundMob, GLOBAL_CAPS.ground_mobility_pct_max, "ground_mobility_pct_total");
  clampCheck(airMob, GLOBAL_CAPS.air_mobility_pct_max, "air_mobility_pct_total");

  // STA y SPD aquí se tratan como "efficiency" (puedes afinar luego)
  clampCheck(sta, GLOBAL_CAPS.STA_efficiency_pct_abs_max, "STA_pct_total");
  clampCheck(spd, GLOBAL_CAPS.ground_mobility_pct_max, "SPD_pct_total (soft cap like mobility)");

  console.log(`✅ Build OK (maskTier=${build.maskTier}, level=${level}). Items=${all.length}`);
  console.log(`   Totals: STR=${str} DEF=${def} STA=${sta} SPD=${spd} groundMob=${groundMob} airMob=${airMob}`);
}

main();

Scripts en package.json (recomendado)
{
  "scripts": {
    "gen:ids": "tsx scripts/generateItemIds.ts data/catalog.v1.json src/catalog/ItemIds.ts",
    "validate:catalog": "tsx scripts/validateCatalog.ts data/catalog.v1.json",
    "validate:build": "tsx scripts/validateBuild.ts data/catalog.v1.json"
  },
  "devDependencies": {
    "tsx": "^4.0.0"
  }
}

Qué te recomiendo después (para que quede “pro”)

scripts/exportCsv.ts (JSON → CSV) y scripts/importCsv.ts (CSV → JSON) para editar catálogo en Sheets y compilarlo.

Un caps.ts central (mis caps globales) compartido entre servidor y cliente.

Cuando quieras, te armo esos 2 scripts también.
Listo — aquí tienes los 2 scripts para exportar/importar entre catalog.json ↔ catalog.csv, pensados para que puedas editar en Google Sheets/Excel y compilar de vuelta a JSON sin perder estructura.

Incluyo además una convención de orden estable (por id) y un manejo seguro de *_json como strings JSON.

scripts/exportCsv.ts (JSON → CSV)
// scripts/exportCsv.ts
/**
 * Exporta catalog JSON a CSV (editable en Sheets/Excel).
 *
 * Uso:
 *   npx tsx scripts/exportCsv.ts data/catalog.v1.json data/catalog.v1.csv
 */

import fs from "node:fs";
import path from "node:path";

type CatalogItem = Record<string, any>;
type CatalogFile = {
  version: string;
  idRanges?: Record<string, [number, number]>;
  items: CatalogItem[];
};

const CSV_COLUMNS = [
  "id",
  "type",
  "tier",
  "slot",
  "name",
  "minLevel",
  "mods_json",
  "ability_json",
  "kit_json",
  "costs_json",
  "cooldowns_json",
  "tradeoffs_json",
  "counterplay_json",
] as const;

function die(msg: string): never {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

function ensureDir(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function escapeCsvCell(value: string): string {
  // CSV standard: si contiene coma, comillas o salto de línea -> envolver en comillas y escapar comillas dobles
  const needs = /[",\n\r]/.test(value);
  if (!needs) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

function jsonCell(obj: any): string {
  if (obj === undefined || obj === null) return "";
  return JSON.stringify(obj);
}

function main() {
  const [, , inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) die("Uso: exportCsv.ts <inputJson> <outputCsv>");

  const raw = fs.readFileSync(inputPath, "utf8");
  const catalog = JSON.parse(raw) as CatalogFile;

  if (!catalog || !Array.isArray(catalog.items)) die("JSON inválido: falta items[]");

  const items = catalog.items.slice().sort((a, b) => Number(a.id) - Number(b.id));

  const lines: string[] = [];
  lines.push(CSV_COLUMNS.join(","));

  for (const it of items) {
    const row: Record<string, string> = {
      id: String(it.id ?? ""),
      type: String(it.type ?? ""),
      tier: String(it.tier ?? ""),
      slot: String(it.slot ?? ""),
      name: String(it.name ?? ""),
      minLevel: String(it.minLevel ?? ""),
      mods_json: jsonCell(it.mods),
      ability_json: jsonCell(it.ability),
      kit_json: jsonCell(it.kit),
      costs_json: jsonCell(it.costs),
      cooldowns_json: jsonCell(it.cooldowns),
      tradeoffs_json: jsonCell(it.tradeoffs),
      counterplay_json: jsonCell(it.counterplay),
    };

    const cells = CSV_COLUMNS.map((col) => escapeCsvCell(row[col] ?? ""));
    lines.push(cells.join(","));
  }

  ensureDir(outputPath);
  fs.writeFileSync(outputPath, lines.join("\n"), "utf8");

  console.log(`✅ Export CSV OK: ${outputPath}`);
  console.log(`   version=${catalog.version}, items=${items.length}`);
}

main();

scripts/importCsv.ts (CSV → JSON)
// scripts/importCsv.ts
/**
 * Importa catalog CSV a JSON. Mantiene:
 * - version e idRanges del JSON base (si lo pasas como tercer argumento)
 *
 * Uso:
 *   npx tsx scripts/importCsv.ts data/catalog.v1.csv data/catalog.v1.fromcsv.json data/catalog.v1.json
 *
 * Si NO pasas baseJson, se genera solo con {version:"vX", items:[...]} (te pedirá version por env o fallback).
 */

import fs from "node:fs";
import path from "node:path";

type CatalogItem = {
  id: number;
  type: string;
  tier: string;
  slot: string;
  name: string;
  minLevel: number;
  mods?: any;
  ability?: any;
  kit?: any;
  costs?: any;
  cooldowns?: any;
  tradeoffs?: any;
  counterplay?: any;
};

type CatalogFile = {
  version: string;
  idRanges?: Record<string, [number, number]>;
  items: CatalogItem[];
};

const EXPECTED_HEADER = [
  "id",
  "type",
  "tier",
  "slot",
  "name",
  "minLevel",
  "mods_json",
  "ability_json",
  "kit_json",
  "costs_json",
  "cooldowns_json",
  "tradeoffs_json",
  "counterplay_json",
];

function die(msg: string): never {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

function ensureDir(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

/** CSV splitter que respeta comillas dobles */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && line[i + 1] === '"') {
      cur += '"';
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function parseJsonCell(cell: string): any | undefined {
  const t = (cell ?? "").trim();
  if (!t) return undefined;
  try {
    return JSON.parse(t);
  } catch {
    // Intento extra por si llega con comillas “dobles” de Sheets
    const unquoted = t.replace(/^"+|"+$/g, "").replace(/""/g, '"');
    return JSON.parse(unquoted);
  }
}

function readBase(basePath?: string): Partial<CatalogFile> {
  if (!basePath) return {};
  if (!fs.existsSync(basePath)) die(`No existe baseJson: ${basePath}`);
  const raw = fs.readFileSync(basePath, "utf8");
  const base = JSON.parse(raw) as CatalogFile;
  return {
    version: base.version,
    idRanges: base.idRanges,
  };
}

function main() {
  const [, , csvPath, outJsonPath, baseJsonPath] = process.argv;
  if (!csvPath || !outJsonPath) die("Uso: importCsv.ts <inputCsv> <outputJson> [baseJson]");

  if (!fs.existsSync(csvPath)) die(`No existe el CSV: ${csvPath}`);
  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const headerLine = lines.shift();
  if (!headerLine) die("CSV vacío");

  const header = splitCsvLine(headerLine);
  for (let i = 0; i < EXPECTED_HEADER.length; i++) {
    if (header[i] !== EXPECTED_HEADER[i]) {
      die(`Header CSV no coincide. Esperado: ${EXPECTED_HEADER.join(",")}\nRecibido: ${header.join(",")}`);
    }
  }

  const base = readBase(baseJsonPath);

  const version =
    (base.version as string | undefined) ||
    process.env.CATALOG_VERSION ||
    "v1.0.0";

  const items: CatalogItem[] = [];
  const ids = new Set<number>();

  for (const line of lines) {
    const row = splitCsvLine(line);
    const get = (i: number) => row[i] ?? "";

    const id = Number(get(0));
    if (!Number.isFinite(id)) die(`ID inválido: "${get(0)}"`);
    if (ids.has(id)) die(`ID duplicado en CSV: ${id}`);
    ids.add(id);

    const type = get(1).trim();
    const tier = get(2).trim();
    const slot = get(3).trim();
    const name = get(4).trim();
    const minLevel = Number(get(5));

    const mods = parseJsonCell(get(6));
    const ability = parseJsonCell(get(7));
    const kit = parseJsonCell(get(8));
    const costs = parseJsonCell(get(9));
    const cooldowns = parseJsonCell(get(10));
    const tradeoffs = parseJsonCell(get(11));
    const counterplay = parseJsonCell(get(12));

    const item: CatalogItem = {
      id,
      type,
      tier,
      slot,
      name,
      minLevel: Number.isFinite(minLevel) ? minLevel : 1,
      ...(mods ? { mods } : {}),
      ...(ability ? { ability } : {}),
      ...(kit ? { kit } : {}),
      ...(costs ? { costs } : {}),
      ...(cooldowns ? { cooldowns } : {}),
      ...(tradeoffs ? { tradeoffs } : {}),
      ...(counterplay ? { counterplay } : {}),
    };

    // validación mínima de campos obligatorios
    if (!item.type || !item.tier || !item.slot || !item.name) {
      die(`Fila incompleta: id=${id} (type/tier/slot/name requeridos)`);
    }

    items.push(item);
  }

  items.sort((a, b) => a.id - b.id);

  const out: CatalogFile = {
    version,
    ...(base.idRanges ? { idRanges: base.idRanges } : {}),
    items,
  };

  ensureDir(outJsonPath);
  fs.writeFileSync(outJsonPath, JSON.stringify(out, null, 2), "utf8");
  console.log(`✅ Import JSON OK: ${outJsonPath}`);
  console.log(`   version=${out.version}, items=${items.length}`);
}

main();

package.json scripts (añádelos)
{
  "scripts": {
    "export:csv": "tsx scripts/exportCsv.ts data/catalog.v1.json data/catalog.v1.csv",
    "import:csv": "tsx scripts/importCsv.ts data/catalog.v1.csv data/catalog.v1.fromcsv.json data/catalog.v1.json",
    "validate:catalog": "tsx scripts/validateCatalog.ts data/catalog.v1.json",
    "gen:ids": "tsx scripts/generateItemIds.ts data/catalog.v1.json src/catalog/ItemIds.ts"
  }
}

Flujo recomendado de trabajo (muy práctico)

Editas data/catalog.v1.csv en Sheets

npm run import:csv

npm run validate:catalog

npm run gen:ids

Commit de catalog.v1.fromcsv.json + ItemIds.ts
Aquí tienes scripts/syncCatalog.ts para hacer todo en un solo comando:

CSV → JSON (manteniendo version + idRanges desde un base JSON)

Validar catálogo

Generar ItemIds.ts

JSON → CSV (re-export “normalizado” para mantener ambos sincronizados)

scripts/syncCatalog.ts
// scripts/syncCatalog.ts
/**
 * Sync completo del catálogo:
 *  1) importCsv (CSV -> JSON)
 *  2) validateCatalog (JSON)
 *  3) generateItemIds (JSON -> ItemIds.ts)
 *  4) exportCsv (JSON -> CSV normalizado)
 *
 * Uso (defaults):
 *   npx tsx scripts/syncCatalog.ts
 *
 * Uso (custom):
 *   npx tsx scripts/syncCatalog.ts \
 *     --csv data/catalog.v1.csv \
 *     --base data/catalog.v1.json \
 *     --outJson data/catalog.v1.json \
 *     --idsOut src/catalog/ItemIds.ts \
 *     --outCsv data/catalog.v1.csv
 */

import { execSync } from "node:child_process";

type Args = {
  csv: string;
  base: string;
  outJson: string;
  idsOut: string;
  outCsv: string;
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);

  const get = (flag: string, fallback: string) => {
    const i = argv.indexOf(flag);
    if (i === -1) return fallback;
    const v = argv[i + 1];
    if (!v || v.startsWith("--")) throw new Error(`Falta valor para ${flag}`);
    return v;
  };

  return {
    csv: get("--csv", "data/catalog.v1.csv"),
    base: get("--base", "data/catalog.v1.json"),
    outJson: get("--outJson", "data/catalog.v1.json"),
    idsOut: get("--idsOut", "src/catalog/ItemIds.ts"),
    outCsv: get("--outCsv", "data/catalog.v1.csv"),
  };
}

function run(cmd: string) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function quote(p: string) {
  // Para espacios en rutas (Windows/macOS/Linux)
  return `"${p.replace(/"/g, '\\"')}"`;
}

function main() {
  const args = parseArgs();

  const csv = quote(args.csv);
  const base = quote(args.base);
  const outJson = quote(args.outJson);
  const idsOut = quote(args.idsOut);
  const outCsv = quote(args.outCsv);

  // 1) CSV -> JSON
  run(`npx tsx scripts/importCsv.ts ${csv} ${outJson} ${base}`);

  // 2) Validate JSON
  run(`npx tsx scripts/validateCatalog.ts ${outJson}`);

  // 3) Generate ItemIds.ts
  run(`npx tsx scripts/generateItemIds.ts ${outJson} ${idsOut}`);

  // 4) JSON -> CSV (normalizado)
  run(`npx tsx scripts/exportCsv.ts ${outJson} ${outCsv}`);

  console.log("\n✅ Sync completo: CSV <-> JSON <-> ItemIds.ts");
}

main();

Añade el comando en package.json
{
  "scripts": {
    "sync:catalog": "tsx scripts/syncCatalog.ts",
    "sync:catalog:custom": "tsx scripts/syncCatalog.ts --csv data/catalog.v1.csv --base data/catalog.v1.json --outJson data/catalog.v1.json --idsOut src/catalog/ItemIds.ts --outCsv data/catalog.v1.csv"
  }
}


Ejecutas:

npm run sync:catalog

Nota práctica (para evitar sobrescribir por accidente)

Si prefieres no sobrescribir data/catalog.v1.json, usa un output separado:

npx tsx scripts/syncCatalog.ts --outJson data/catalog.v1.fromcsv.json --outCsv data/catalog.v1.csv


Si quieres, el siguiente “upgrade” es que syncCatalog.ts también genere un catalogHash (keccak/sha256) para que server+client verifiquen que están usando el mismo catálogo en runtime.
Voy a proponerte una estructura de “bonos por máscara” que mantenga tu regla clave (el jugador sube de nivel) sin volverlo pay-to-win, y cómo empaquetar eso en “uniformes completos” vendibles con buena economía.

Me gusta la dirección, pero con una condición: si las máscaras empiezan a dar poder “directo”, puedes romper tu idea central (“el jugador sube de nivel, no la máscara”) y convertirlo en P2W sin querer.

La forma correcta de hacerlo es que la máscara aporte “identidad / estilo” (pasivos, afinidades, límites y sinergias) pero que el poder fuerte siga viniendo del progreso del jugador + equipo. Así puedes vender uniformes completos sin que sean “paga y ganas”.

Aquí va mi opinión técnica (y práctica) para que funcione.

1) Qué debería dar una máscara (sin romper el diseño)

Piensa en la máscara como un chasis / clase: define cómo juegas, no cuánto pegas.

A. “Afinidad” (recomendado)

Cada máscara tiene 1 afinidad principal (y 1 secundaria opcional):

Striker (daño a golpes)

Grappler (agarres / control)

Aerial (movilidad / aire)

Tank (resistencia)

Trickster (engaños / mixups)

Mage (poderes… solo si Legendary y nivel ≥ 50)

La afinidad no da números enormes, da reglas pequeñas y estilo:

“+5% XP en victorias con combos largos”

“Tu primer dash en el round cuesta menos stamina”

“Tu bloqueo perfecto reduce cooldown 0.2s”

“Ganas +1 opción de cancel (pero consumes más stamina)”

B. “Limiters” (tradeoffs)

Para que no sea P2W: toda máscara que da algo extra, también limita otra cosa:

Más movilidad pero menos resistencia al stagger

Más daño en aire pero peor suelo

Más control de grapples pero menos rango en strikes

Esto hace que haya metajuego, no “la legendaria siempre gana”.

C. “Cap Unlocks” (mejor que “+daño”)

En vez de “+10% daño” (peligroso), usa “eleva el techo”:

Common: cap normal

Rare: cap un poco mejor en 1 categoría

Legendary: cap mejor en 2 categorías, pero con tradeoff

Ejemplo:

Common: cap movilidad 100, cap daño 100

Rare: cap movilidad 105 (pero cap defensa 95)

Legendary: cap movilidad 110 y cap aire 110 (pero cap stamina 90)

Así el jugador sigue teniendo que ganarse el progreso y aprender matchups.

2) Propuesta de beneficios por rareza (simple y vendible)
Common Masks (base)

1 “Mask Passive” ligero (solo calidad de vida o estilo)

1 slot (Trait) desbloquea en nivel 8 (tu regla)

No powers

Ejemplos de pasivos common:

“+1% XP por round jugado”

“La primera vez que cambias de máscara en el día, no pagas costo”

“Tus combos fáciles hacen 2% menos daño pero son más consistentes”

Rare Masks (especialistas)

1 Passive + 1 “Synergy Tag” (para outfits/patches)

2 slots (Trait + Moves) desde el inicio (tu regla)

Mejoran consistencia, no “poder bruto”

Ejemplo:

Tag: Aerial, synergy con capas/mallas

Passive: “Al aterrizar, recuperas un poco de stamina (cooldown)”

Legendary Masks (identidad fuerte, no stats brutales)

1 Passive fuerte + 1 “Signature Mechanic” (regla única)

3 slots (Trait + Moves + Power)

Power slot desbloquea con nivel ≥ 50 (tu regla)

Debe tener tradeoff claro

Ejemplo:

Signature: “Puedes cancelar un golpe en salto 1 vez por combo”

Tradeoff: “Tus golpes en suelo hacen -3%”

3) Cómo vender “uniformes completos” sin que sea pay-to-win

La idea de set completo es buenísima si el “poder” es sinergia, no “sumas de stats”.

A. Define “Set Bonuses” por combinación (2/3/4/5 piezas)

Uniforme = máscara + botas + mallas + playera + capa.

Haz bonus por “piezas equipadas”:

2 piezas: bonus pequeño (cosmético + micro-ventaja)

3 piezas: bonus estilo (combo route / stamina economy)

4 piezas: bonus de kit (pero con tradeoff)

5 piezas: “Signature Style” (no más daño, más opciones)

Ejemplo (Set Aerial):

2 piezas: +pequeña reducción de caída

3 piezas: air-dash consume menos stamina

4 piezas: 1 salto extra (pero menos defensa)

5 piezas: “Dive Kick” especial (cooldown + counterplay)

B. Bonus debe ser “horizontal”, no “vertical”

Horizontal = más opciones / rutas / movilidad / herramientas situacionales

Vertical = +daño +vida +defensa sin costo (evitar)

C. Todos los sets deben tener counterplay

Si set da “volar”, debe existir:

antiaéreos

cooldowns

stamina cost

timing punish

Así un set es “distinto”, no “mejor”.

4) Estructura técnica recomendada para 100 máscaras (clean + escalable)
A. Atributos fijos por máscara (minimalistas)

Cada máscara (NFT) podría tener:

tier: common/rare/legendary

affinity: striker/grappler/aerial/tank/trickster/mage

passiveId: referencia a una tabla de pasivos

tag1/tag2: tags de sinergia

signatureId (solo legendary)

Importante: no metas 30 stats por máscara. Mantén la máscara “legible”.

B. Parches y outfits son “mods”

Parches: se gastan 1 vez, tradeables

Outfits: piezas tradeables o coleccionables

En combate calculas:
PlayerBase(level) + MaskRules + PatchMods + OutfitMods + SetBonus

C. Balance por caps globales

Tu sistema ya sugiere esto: define caps globales por level para:

daño, defensa, movilidad, stamina, cooldown economy

Y deja que el equipo solo mueva la distribución, no rompa caps.

5) Mi sugerencia concreta (lo que yo haría)

Si quieres que las máscaras “agreguen algo”, haz esto:

Cada máscara tiene 1 Passive (micro)

Rare y Legendary tienen Synergy Tags (para vender sets)

Legendary además tiene Signature Mechanic, PERO:

no es “+daño”, es “nueva opción”

tiene costo/cooldown/tradeoff

El “uniforme completo” da un Set Bonus por piezas (2/3/4/5)

Todo está limitado por caps por level.

Con eso:

Mantienes tu filosofía (“nivel del jugador manda”)

Creas mercado real (sets por estilo y meta)

Evitas P2W

Y puedes vender “uniformes completos” que sean deseables

Si me dices 2 cosas, te dejo una propuesta final ya lista para documentar (tipo whitepaper + reglas exactas):

¿Los outfits serán NFT también o algunos serán “off-chain cosmetics” y solo ciertos serán tradeables?

¿Tu combate es más estilo Smash / platform fighter, 2D clásico, o arena 3D? (para definir bien movilidad/capa/aire).
Perfecto: outfits no-NFT + máscaras/parches sí NFT + arena 3D es una combinación muy buena porque te deja:

Economía on-chain clara (máscaras + parches = propiedad real y tradeable)

Gameplay/balance controlado off-chain (outfits = tuning + cosméticos sin especulación)

Menos fricción legal/UX (no todo es blockchain)

Aquí va cómo yo lo diseñaría para que las máscaras “aporten algo” y puedas vender “uniformes completos” sin romper tu regla de que el jugador es el que sube de nivel.

1) Qué significa “uniforme completo” si el outfit no es NFT

Un uniforme completo puede ser un Bundle de tienda que incluye:

Máscara (NFT): define estilo + reglas + capacidad (tier/slots/afinidades)

Parches (NFT): definen la build real (1 vez por slot)

Outfit (no NFT): piezas cosméticas + micro-bonos (cuentas/off-chain)

Resultado: un bundle vendible sin que el outfit sea NFT, pero sí “coleccionable” dentro del juego.

2) Cómo hacer que la máscara agregue algo al jugador (sin P2W)

En arena 3D, el riesgo es que “bonos” se sientan brutales (movilidad, tracking, rango). Entonces la máscara debe dar:

A) Reglas de estilo (recomendado)

En vez de +daño, +vida, etc., usa micro-reglas con tradeoff:

Control: “Tus golpes ligeros tienen mejor tracking pero consumen más stamina”

Aerial: “Tu salto tiene un micro impulso lateral pero tu guardia perfecta es más difícil”

Grappler: “Agarres tienen un poco más de prioridad pero tus dashes son más lentos”

Trickster: “Después de esquivar, tu siguiente golpe tiene mejor reach pero cooldown de esquiva sube”

Esto mantiene la máscara como “clase”.

B) Afinidad + Tag (para vender sets)

Cada máscara tiene:

Affinity: Aerial / Grappler / Striker / Tank / Trickster

SynergyTags: por ejemplo Aerial, Fire, Shadow, ChainCombo, Counter

Luego los outfits y parches se diseñan para tener sinergia con tags.

C) Tradeoff obligatorio

Cada beneficio de máscara debe venir con un costo:

stamina cost

cooldown

menor defensa

peor tracking en otra categoría

Si no hay tradeoff, con 100 máscaras vas a terminar con “top 3” y se muere la variedad.

3) Beneficios por rareza (limpios y escalables)
Common (gran cantidad, accesibles)

1 Passive Light (muy pequeño, calidad de vida / estilo)

Slot común se activa en nivel ≥ 8 (tu regla)

No powers

Ejemplos:

“+1% XP por combate completado”

“Cambio de máscara 10% más rápido fuera de combate”

“Primer dash del round cuesta -5% stamina”

Rare (especialistas)

1 Passive + 1 Tag extra

2 slots desde el inicio (tu regla)

En arena 3D: rare debe aportar consistencia (tracking, recovery, control), no burst

Ejemplos:

“Tus ataques horizontales pierden menos tracking cuando el rival gira alrededor”

“Recuperas stamina un poco más rápido después de un knockdown (cooldown interno)”

Legendary (identidad fuerte, sin stats brutos)

1 Passive fuerte + 1 Signature Mechanic (regla única)

3 slots + power slot solo si nivel ≥ 50 (tu regla)

Tradeoff claro y counterplay claro

Ejemplos de Signature Mechanic (arena 3D):

“Puedes hacer Air Step 1 vez cada 12s” (pero tu defensa baja un poco)

“Tus agarres tienen feint (amago) 1 vez cada X” (pero tus golpes ligeros hacen menos daño)

“Tus ataques aéreos tienen un ángulo extra” (pero aterrizas con más endlag)

4) Outfits (no NFT) en arena 3D: qué bonitos bonos sí y cuáles NO

Como outfits son off-chain, puedes permitir bonuses más directos, pero controlados.

Sí (seguros):

Bonos situacionales / utilitarios

Pequeños ajustes con límites/caps

Cosméticos + “feel” de movimiento

Ejemplos por pieza:

Boots: -2% costo de sprint / mejor aceleración (cap)

Tights: +2% altura de salto / +pequeña corrección aérea

Shirt: -2% stagger recibido / +poise mínimo (cap)

Cape: +micro glide / +aerial control (pero sube consumo stamina en aire)

No (peligrosos / P2W):

+daño directo

+vida/armadura grande

cooldowns demasiado reducidos

invulnerabilidad, invisibilidad real, auto-aim fuerte

Regla de oro: outfit ajusta movimiento y consistencia, no “mata más rápido”.

5) “Uniformes completos” como producto: Set Bonuses sin NFT

Como no es NFT, el set bonus lo controlas perfecto.

Set Bonus por piezas (2/3/4/5)

2 piezas: bonus ligero (calidad de vida)

3 piezas: bonus de estilo

4 piezas: bonus fuerte con tradeoff

5 piezas: “Signature Style” (nueva opción, no más daño)

Ejemplo “Aerial Set”:

2: aterrizaje más estable

3: micro air-drift

4: 1 air-dash cada 15s (consume stamina alto)

5: “Dive Attack” especial (counter: antiaéreo, cooldown)

Esto vende porque se siente único, no porque sea más fuerte.

6) Parches (NFT) como “verdadero build” + anti-exploit

Parches ya son el corazón. En arena 3D yo haría:

Parches con atributo + costo (stamina, cooldown, penalización)

Equip lock por match (no puedes equipar y vender a mitad)

Match loadout hash (ya lo tienes en la web) guardado en servidor

Importante: como el combate es 3D, asegúrate que los parches no rompan:

tracking

hitboxes

movement tech sin counterplay

7) Arquitectura recomendada (para que sea hack-resistant)

Como es PVP arena 3D:

Servidor autoritativo (server decides hits, damage, cooldowns)

Cliente solo manda inputs

XP y recompensas se calculan server-side

Si luego “claim on-chain”: el server firma un recibo (matchId único) para mintear/reclamar

Esto es clave si tus NFTs tienen valor.

8) Mi recomendación final (con tu setup exacto)

Con tus restricciones, yo propondría esto como “regla oficial”:

El power real viene de: nivel del jugador + parches equipados

La máscara da: afinidad + pasivo + (rare/legendary) mecánica única con tradeoff

Outfits (no NFT) dan: movilidad/consistencia con caps + set bonuses por piezas

Uniforme completo vende: identidad + estilo + set bonus, no “más daño”

Si quieres, en el siguiente mensaje te dejo un sistema concreto listo para tu documento (muy técnico):

Tabla de caps por level (movilidad/defensa/daño/stamina)

5 afinidades con 10 pasivos base (para llegar a 100 máscaras combinando pasivo+tags)

6 ejemplos de Legendary “signature mechanics” balanceadas para arena 3D

Modelo de datos JSON para máscaras/parches/outfits + reglas de validación de builds.
Voy a proponerte un sistema técnico completo para 1000 máscaras: cómo generarlas sin volverte loco (plantillas + modulares), cómo balancear con caps por nivel, ejemplos de pasivos/signatures, y un esquema JSON de validación para servidor.

Perfecto: 1000 máscaras es totalmente viable si lo planteas como un sistema modular (plantillas + variaciones), no como 1000 diseños “hechos a mano” en reglas. Te dejo un diseño técnico listo para poner en tu doc.

0) Principios (para que 1000 no explote el balance)

El jugador escala verticalmente (nivel 1–1000).

La máscara escala horizontalmente (estilo/reglas/afinidad), nunca “+daño bruto” sin costo.

Parches son el build real (NFT, 1-use por slot).

Outfits son tuning y sabor (off-chain, con caps y set bonuses).

1) Cómo generar 1000 máscaras sin destruir el diseño

No hagas 1000 “pasivos únicos”. Haz:

A) Plantillas + parámetros (lo mejor)

Cada máscara = combinación de:

Tier: Common / Rare / Legendary

Affinity: Striker / Grappler / Aerial / Tank / Trickster (+ Mage solo Legendary con nivel ≥ 50)

Passive: de un catálogo finito

Tags: 2–4 tags (sinergias)

Signature: solo Legendary (catálogo finito)

Tradeoff: siempre (catálogo finito)

Así puedes tener miles de combinaciones controladas.

B) Distribución sugerida (1000 supply)

Ejemplo equilibrado:

Common: 700

Rare: 250

Legendary: 50

(Esto mantiene Legendary deseable sin romper el meta.)

2) Caps por nivel (para evitar P2W en arena 3D)

Define 5 “budget stats” internos (no públicos si no quieres):

DMG (daño total permitido por kit)

DEF (mitigación/stagger resist total)

MOB (movilidad: sprint/dash/turn)

STA (stamina + regen)

CDR (economía de cooldowns/skills)

A) Budget base por nivel (simple y escalable)

Usa una función suave (ejemplo):

Budget(level) = 100 + 0.22 * level

nivel 1 → 100.22 ~ 100

nivel 1000 → 320

Ese “budget” se reparte en categorías.

B) Reglas duras (lo importante)

Ningún item/máscara/outfit puede exceder caps por categoría.

Las máscaras y outfits solo redistribuyen el budget.

Los parches activan herramientas, pero su “costo” consume budget o impone tradeoffs.

Esto hace imposible “comprar” stats infinitos.

3) Qué da la máscara (modelo definitivo)

Cada máscara entrega tres cosas:

1) Affinity (estilo)

Define “tendencia” (no poder bruto).

Striker: mejor consistencia en strikes (pero peor grapples)

Grappler: prioridad/ventanas en agarre (pero peor movilidad)

Aerial: control aéreo (pero peor defensa suelo)

Tank: poise/stagger resist (pero peor sprint)

Trickster: feints/esquivas/turn tech (pero menor daño directo)

Mage: powers (solo Legendary + nivel ≥ 50)

2) Passive (catálogo finito, paramétrico)

Un passive = regla pequeña + cooldown interno + tradeoff.

Ejemplo formato:

“AfterPerfectDodge: nextAttackTracking +X for Y sec; DodgeCooldown +Z%”

3) Tradeoff (obligatorio)

Siempre hay una penalización visible o medible.

4) Rareza: reglas concretas
Common

1 passive “light”

tags 1–2

slot común se habilita en nivel ≥ 8 (tu regla)

sin signature

Rare

1 passive “medium”

tags 2–3

2 slots desde el inicio (Trait + Moves)

Legendary

1 passive “strong” + 1 signature

tags 3–4

3 slots + Power slot (solo si nivel ≥ 50)

signature siempre con cooldown + counterplay + tradeoff fuerte

5) Catálogo de pasivos (ejemplos listos)

Te doy 12 ejemplos (parametrizables) que sirven para cientos de máscaras:

Corner Hunter (Striker)
Si el rival está a < 6m: tracking +X% por 2s, pero stamina regen -Y% por 3s.

Chain Starter (Striker)
Primer golpe conectado del round: +1 ventana de cancel, pero daño del combo -Z%.

Grip Window (Grappler)
Tras un parry: ventana de agarre +X ms, pero dash cooldown +Y%.

Anchor (Tank)
Si estás por debajo de 40% stamina: stagger resist +X%, pero sprint speed -Y%.

Air Control (Aerial)
En el aire: control lateral +X%, pero aterrizaje recovery +Y ms.

Spin Step (Trickster)
Tras girar 90° cerca del rival: next hit reach +X%, pero defense cap -Y.

Comeback XP (All)
Si pierdes: XP +X% (solo PVE/Ranked?), pero rewards tokens -Y% (si usas economía).

Clean Footwork (All)
Sprint cost -X%, pero ataques pesados cost +Y stamina.

Hard Read (All)
Si castigas un whiff: daño +X% por 1 golpe, pero cooldown interno 10s.

Rally (Tank)
Knockdown recibido: stamina regen +X% por 3s, pero mobility cap -Y.

Sky Feint (Aerial)
1 vez cada 12s: fake aerial (animación), pero reduce guard stability -Y.

Mystic Channel (Mage/Legendary)
Cada power cast: gana stack, al 3er stack: bonus pequeño, pero cooldown +Y%.

Con 12 pasivos base + 5 afinidades + 20 tags, ya tienes cientos de combinaciones.

6) Signatures Legendary (arena 3D) con counterplay

6 signatures “vendibles” sin romper el juego:

Air Step (CD 14s)
Un micro air-dash extra. Counter: antiaéreos, stamina cost alto.

Grapple Feint (CD 16s)
Amago que fuerza reacción. Counter: paciencia, punish si whiff.

Shadow Reposition (CD 18s)
Reposiciona 3m lateral si el rival falla golpe. Counter: no whiff, tracking skills.

Guard Break Pulse (CD 20s)
Solo si el rival bloqueó 3 veces seguidas. Counter: esquivar, moverse.

Sky Dive Tool (CD 16s)
Ataque vertical con telegráfica clara. Counter: rodar, antiaéreo.

Arena Mark (CD 22s)
Marca un área: dentro obtienes pequeña ventaja de control. Counter: salir del área.

Todas deben estar limitadas por:

cooldown

stamina cost

vulnerabilidad en startup

anti-looping rule (no repetir sin ventana)

7) Parches NFT: reglas “server-first”

Tu regla de tiers coincidentes está excelente. Hazlo así:

Patch.tier == Mask.tier obligatorio

SlotType:

Slot1 Trait

Slot2 Moves

Slot3 Power (solo Legendary + nivel ≥ 50)

One-time equip: el patch queda “consumed” o “bound” al equip (según tu economía)

Anti-exploit recomendado

“Equip Lock”: al iniciar match, parches usados quedan bloqueados hasta terminar match.

“Match Receipt”: server firma {matchId, playerId, loadoutHash, timestamp}.

8) Outfits off-chain: cómo meterlos sin P2W

Outfits = “tuning” + “set feel”.

Boots: aceleración/sprint economy (cap)

Tights: jump/air control (cap)

Shirt: stagger resist ligero (cap)

Cape: glide/air tech (cap)

Set bonuses (2/3/4/5 piezas) solo “opciones”, no stats brutos.

9) JSON técnico (estructura recomendada)
Mask NFT metadata (simplificado y escalable)
{
  "tokenId": 123,
  "name": "Mask #123",
  "tier": "rare",
  "affinity": "aerial",
  "tags": ["Aerial", "ChainCombo", "Wind"],
  "passiveId": "AIR_CONTROL_V1",
  "passiveParams": { "airControlPct": 6, "landingRecoveryMs": 90 },
  "tradeoffId": "DEF_CAP_DOWN",
  "tradeoffParams": { "defCapDelta": -4 },
  "signatureId": null
}

Patch metadata
{
  "patchId": "PCH-7781",
  "tier": "rare",
  "slotType": "moves",
  "effectId": "MOVE_ROUTE_KNEE",
  "effectParams": { "cooldownSec": 10, "staminaCost": 14 },
  "oneTimeEquip": true
}

Validación server (reglas mínimas)

Mask tier define max slots: common=1 rare=2 legendary=3

Power slot solo si tier=legendary AND level>=50

Common slot1 solo si level>=8 (si mantienes esa regla)

Patch tier == mask tier

Budget/caps por nivel (reparte DMG/DEF/MOB/STA/CDR)

10) Tu decisión clave (para cerrar el sistema)

Ya con 1000 máscaras, lo más importante es escoger:

¿Las máscaras deben dar bonus “numérico” o “reglas”?

Mi recomendación firme para arena 3D PVP:

90% reglas + 10% micro números con caps
porque el 3D amplifica mucho las ventajas de movilidad/tracking.

Si quieres, te hago el “paquete completo” en el siguiente mensaje:

Tabla de caps por rango de nivel (1–50 / 51–200 / 201–500 / 501–1000)

Catálogo de 30 pasivos + 12 tradeoffs + 20 tags (suficiente para 1000 máscaras sin repetirse mucho)

Distribución exacta de tiers/afinidades para que el meta no se incline.

Solo dime: ¿quieres que la distribución de 1000 sea 700/250/50 como sugerí, o prefieres algo más agresivo (ej. 800/180/20)?
que sea fijo.
Perfecto: turn rate / tracking tolerance fijos es una gran decisión para arena 3D porque evita que un jugador “alto nivel” se sienta incomparable de controlar/pegar. Entonces el progreso (nivel) se concentra en economía y opciones, no en “auto-aim” o movilidad imposible.

Aquí queda el sistema ajustado con esa regla.

1) Qué queda FIJO (no escala con nivel)

Esto define el “skill floor/ceiling” y evita P2W por stats invisibles:

Turn rate base (velocidad de giro)

Tracking tolerance / aim-assist (si existe, que sea idéntico para todos)

Aceleración base (si quieres, fijo)

Velocidad máxima base (fija)

Hitbox/hurtbox (fijo)

Frame data base (fijo)

Si alguien quiere “sentirse más rápido”, eso debe venir de outfits/pasivos y siempre con caps/tardeoffs, pero sin que el nivel lo aumente.

2) Qué SÍ escala con nivel (controlado)

El nivel solo escala en 3 cosas seguras:

A) Stamina economy

stamina max (poco)

stamina regen (poco)

costo de acciones (poco)

B) Cooldown economy

mejora pequeña a CDR global, o unlock de “cooldown slots” (opciones)

C) Acceso a sistemas / slots

nivel 8: slot común (common masks)

nivel 50: power slot (legendary)

Y listo. Nada de “más tracking” o “giro más rápido”.

3) Fórmulas recomendadas (nivel 1–1000) sin tocar turn/tracking

El objetivo es que el nivel importe, pero no rompa matchups.

3.1 Stamina Max

STA_MAX(level) = 100 + floor(level / 25)

nivel 1: 100

nivel 50: 102

nivel 200: 108

nivel 500: 120

nivel 1000: 140

Esto es un incremento gradual, útil, pero no absurdo.

3.2 Stamina Regen

STA_REGEN(level) = 10.0 + (level * 0.003) por segundo

nivel 1: 10.003/s

nivel 1000: 13.0/s

3.3 Cooldown Economy (muy suave)

En vez de bajar todos los cooldowns (peligroso), usa CDR cap mínimo:

CDR_MULT(level) = 1.00 - min(0.10, level / 10000)

max 10% a nivel 1000 (y puedes bajarlo a 6–8% si quieres más competitivo)

Importante: este CDR global solo aplica a habilidades, no a ataques básicos.

4) Budgets/caps (ajustado a “fijo turn/tracking”)

Como turn/tracking no escala, el “budget” se enfoca en:

DMG budget (cap total de daño por ventana)

DEF budget (cap de mitigation/poise)

STA budget (cómo gastas stamina)

CDR budget (skills)

UTILITY budget (cosas como salto/glide/air-step, etc.)

Pero MOB budget no toca velocidad máxima ni turn rate; solo puede tocar:

costo de sprint

costo de dash

micro air control

recovery de aterrizaje (siempre con tradeoff)

5) Reglas nuevas para outfits y máscaras (para respetar lo fijo)
Outfits (no NFT)

Permitidos:

SprintCostMult (ej. -3% a -8%)

DashCostMult (ej. -3% a -8%)

AirControlMult (ej. +2% a +7%)

LandingRecoveryDelta (ej. -20ms a +80ms)

StaggerResistDelta (micro)

Prohibidos:

TurnRateDelta

TrackingToleranceDelta

MaxSpeedDelta (si quieres, 100% prohibido)

Auto-aim buffs

Máscaras (NFT)

Pasivos y signatures deben ser reglas y “economía”, no tracking/turn.

Si quieres que algunas se sientan “más ágiles”, que sea:

“dash cuesta menos” o “air control sube”, no “giro más rápido”.

6) Ajuste de catálogo de tradeoffs (para arena 3D)

Sustituye los tradeoffs que antes tocaban turn/tracking por otros:

Tradeoffs fuertes pero justos

STAMINA_COST_UP

LANDING_RECOVERY_UP

BLOCK_STABILITY_DOWN

WHIFF_VULN_UP

COOLDOWN_LOCKOUT (después de usar signature, CD +X por 3s)

POISE_DOWN (micro, no destruir)

Y mantén DMG/DEF/STA/CDR cap down.

7) Validación de equilibrio (regla de oro)

Para que no se vuelva P2W:

Un Legendary siempre debe:

dar una opción única (signature)

tener cooldown + costo + counterplay

venir con un tradeoff que se sienta

Un Common bien jugado debe poder ganar si el rival no domina spacing/lecturas.

8) Lo que yo haría como “regla oficial” (texto listo)

“MaskedWrestler is skill-first: core movement, turning and targeting are identical for all players. Player level increases stamina and cooldown economy gradually, and unlocks equipment systems (Common slot at level 8; Legendary power slot at level 50). Masks define playstyle through passives, tags and (Legendary) signatures with clear tradeoffs and counterplay.”

Si te sirve, lo siguiente que puedo entregarte (sin preguntas extra) es:

Tabla de límites exactos para outfits (máximos permitidos por pieza y por set)

12 ejemplos de Legendary ya “listos para producción” con cooldown/costo/tradeoff/counterplay

1000-mint generator plan: cómo asignar pasivos/tags/tradeoffs para que no salgan combinaciones rotas (con reglas de exclusión).
Perfecto. Aquí tienes lo que me pediste en 3 bloques listos para “reglas oficiales”: (A) límites exactos de outfits, (B) 12 Legendary listas, (C) plan de generación para mintear 1000 sin combinaciones rotas. Todo respetando tu decisión: turn rate / tracking fijos.

A) Límites exactos para Outfits (off-chain)
1) Variables permitidas (y prohibidas)

Permitidas (tuning “seguro”):

SprintCostMult (costo de stamina al sprint)

DashCostMult (costo de stamina al dash)

AirControlMult (control lateral en aire)

LandingRecoveryDeltaMs (recovery al aterrizar)

StaggerResistDelta (micro)

Prohibidas (por diseño):

TurnRateDelta

TrackingToleranceDelta

MaxSpeedDelta

AimAssistDelta

RawDamageDelta, RawHPDelta

2) Caps por pieza (máximos absolutos)

Estos caps son “hard” (no se pueden pasar ni con sets):

Pieza	Efectos permitidos	Cap recomendado
Boots	SprintCostMult, DashCostMult	Sprint cost: hasta -8% / Dash cost: hasta -6%
Tights	AirControlMult, LandingRecoveryDeltaMs	Air control: hasta +7% / Landing: hasta -25ms (o +60ms si es tradeoff)
Shirt	StaggerResistDelta, DashCostMult	Stagger resist: hasta +4 / Dash cost: hasta -4%
Cape	AirControlMult, LandingRecoveryDeltaMs	Air control: hasta +6% / Landing: hasta -15ms (o +80ms si es tradeoff)

StaggerResistDelta lo manejo como puntos internos (no porcentaje) porque en arena 3D el stagger es delicado.

3) Caps por set (suma total equipada)

Aunque cada pieza tenga su bonus, el total equipando 4 piezas no debe pasar:

SprintCostMult total: mínimo -12%

DashCostMult total: mínimo -10%

AirControlMult total: máximo +10%

LandingRecoveryDeltaMs total: mínimo -30ms

StaggerResistDelta total: máximo +6

Esto asegura que el outfit se siente “mejor” pero no rompe el PVP.

4) Set bonuses (2/3/4/5 piezas) — solo “horizontal”

Regla: set bonuses deben ser opciones con cooldown/costo, no stats planos.

Ejemplos de set bonus global (no por tipo):

2 piezas: “Swap de máscara fuera de combate 20% más rápido” (QoL)

3 piezas: “Después de parry, tu siguiente dash cuesta 0 stamina” (CD 14s)

4 piezas: “Una vez cada 18s, puedes hacer un micro-hop lateral” (consume stamina alto)

5 piezas: “Signature Style Move” (un movimiento nuevo con counterplay y CD)

B) 12 Legendary Masks listas (arena 3D, counterplay real)

Cada Legendary tiene: Affinity + Tags + Passive + Signature + Tradeoff fuerte.
(Los números son ejemplo “production-ready”; luego se afinan en playtests.)

1) “El Halcón de Jade”

Affinity: Aerial | Tags: Aerial, Mobility, Precision, Wind

Passive: AirControl +6% por 2.5s tras salto perfecto (ICD 10s)

Signature: Air Step (CD 14s, stamina 22)

Tradeoff: LandingRecovery +60ms

2) “La Muralla”

Affinity: Tank | Tags: Endurance, GuardBreak, Counter, StaminaFlow

Passive: tras bloquear 3 hits, stamina regen +8% por 3s (ICD 20s)

Signature: Guard Break Pulse (CD 20s, condición “3 blocks seguidos”)

Tradeoff: DashCost +8%

3) “El Coyote”

Affinity: Trickster | Tags: WhiffPunish, Mobility, Counter, Shadow

Passive: si esquivas un ataque, tu siguiente golpe gana reach “micro” (ICD 14s)

Signature: Shadow Reposition (CD 18s, solo si rival whiff)

Tradeoff: DEF cap -6

4) “El Verdugo”

Affinity: Striker | Tags: Rushdown, ChainCombo, Precision, Knockback

Passive: primer hit conectado del round reduce endlag 1 acción (ICD 12s)

Signature: Chain Extension (CD 20s, 1 cancel extra; combo DMG -6%)

Tradeoff: StaminaCost golpes pesados +10%

5) “El Domador”

Affinity: Grappler | Tags: GrappleTech, WallPin, Endurance, Counter

Passive: tras parry, ventana de agarre +180ms (ICD 14s)

Signature: Grapple Feint (CD 16s)

Tradeoff: SprintCost +10%

6) “La Sombra del Ring”

Affinity: Trickster | Tags: Disable, Shadow, CooldownFlow, WhiffPunish

Passive: castigo de whiff reduce CD de esquiva 0.6s (ICD 12s)

Signature: Micro Silence (CD 24s, 2s de -“skill economy” muy leve)

Tradeoff: CDR cap -8 (y la Silence es suave, no “apaga al rival”)

7) “El Relámpago”

Affinity: Striker | Tags: Mobility, Rushdown, Precision, Wind

Passive: dash tras golpe ligero cuesta -6% stamina (ICD 10s)

Signature: Vertical Launch (CD 20s, telegráfico)

Tradeoff: BlockStability -10%

8) “El Coloso”

Affinity: Tank | Tags: Endurance, Knockback, GuardBreak, StaminaFlow

Passive: bajo 40% stamina, stagger resist +4 por 4s (ICD 18s)

Signature: Arena Mark (CD 22s, zona de control)

Tradeoff: MOB cap -6

9) “La Tormenta”

Affinity: Aerial | Tags: Aerial, Wind, ChainCombo, CooldownFlow

Passive: aterrizaje limpio devuelve 10 stamina (ICD 12s)

Signature: Sky Dive Tool (CD 16s, counter: dodge/anti-air)

Tradeoff: DMG cap -6

10) “El Ingeniero”

Affinity: Grappler | Tags: GrappleTech, Precision, GroundControl, Counter

Passive: throws reposicionan +mejor control de dirección (ICD 16s)

Signature: Counter Banner (CD 18s, solo si parry correcto)

Tradeoff: Dodge CD +12%

11) “El Caminamuros”

Affinity: Aerial/Tank híbrido | Tags: Mobility, WallPin, Endurance, Precision

Passive: cerca de pared, landing recovery -20ms (ICD 12s)

Signature: Wall Run Burst (CD 18s, stamina 24)

Tradeoff: STA cap -8

12) “Arcano” (Mage) — (solo 2 en toda la colección)

Affinity: Mage | Tags: Mystic, Fire/Wind/Shadow (elige 1), CooldownFlow, Precision

Passive: cada cast da 1 stack; a 3 stacks, mejora micro (ICD 20s)

Signature: Mystic Channel (CD 26s, telegráfico, counterplay claro)

Tradeoff: DEF cap -10 + StaminaCost powers alto

C) Plan de generación para mintear 1000 (sin combinaciones rotas)
1) Catálogos finitos + parámetros

Pasivos: 30 (los que ya definimos)

Tradeoffs: 12

Tags: 20

Signatures: 12 (solo Legendary)

Cada entrada es paramétrica (ej. trackingPct, icdSec, staminaCost), pero con rangos por tier.

2) Rangos por tier (para que todo sea balanceable)

Define “power budgets” internos por tier:

Common: Passive power score 1.0–1.8 + Tradeoff 0.6–1.2

Rare: Passive 1.8–2.8 + Tradeoff 1.2–2.0

Legendary: Passive 2.6–3.6 + Signature 2.0–3.0 + Tradeoff 2.5–3.5

Un Legendary siempre “paga” su signature con tradeoff más alto.

3) Reglas de exclusión (hard)

Evita combos rotos desde la generación:

Si signature = Air Step ⇒ tradeoff debe incluir LandingRecoveryUp o STA_CAP_DOWN

Si tags incluyen Disable ⇒ tradeoff debe incluir CDR_CAP_DOWN o DEF_CAP_DOWN

Si affinity = Tank ⇒ no permitas pasivos de “combo extension”

Si tags incluyen Mobility + Aerial ⇒ prohíbe “LandingRefund” + “AirControl” juntos en Legendary

Solo 2 Mage en total, y sus powers deben tener costos/telegraph altos

4) Regla de “sinergia controlada” (soft)

Calcula un SynergyScore (0–100) basado en:

afinidad + tags + passive + signature

Acepta solo máscaras con:

Common: synergy 30–65

Rare: 40–75

Legendary: 50–82
(si >82, es candidata a romper meta, se re-roll)

5) Proceso de generación (determinista y auditable)

Generas seed por tokenId (on-chain o en script)

Asignas tier según distribución 700/250/50

Asignas affinity según tabla

Seleccionas tags (con pesos por affinity)

Seleccionas passive + params (rangos por tier)

Si Legendary: seleccionas signature + params

Seleccionas tradeoff (obligatorio) cumpliendo reglas hard

Evalúas PowerScore y SynergyScore

Si falla, re-roll con seed derivado (seed2 = hash(seed + "REROLL1")) hasta cumplir

6) “Uniqueness” real para 1000

Para que no se sientan repetidas:

Common: puedes repetir pasivo, pero no la combinación exacta (passiveId + tradeoffId + tags set)

Rare: reduce repetición (máximo 3 por combinación)

Legendary: combinación única total (1-of-1 en reglas)

Resultado final (lo que ganas con este sistema)

1000 máscaras con diversidad real (sin diseñar 1000 reglas manuales)

Legendary deseables por “mecánicas”, no por stats

Outfits vendibles como “uniformes completos” sin blockchain

PVP arena 3D competitivo porque turn/tracking no escalan

Si quieres, el siguiente paso natural (y muy útil) es que te entregue un “Rulebook v1” en formato listo para web/whitepaper con:

definiciones oficiales (glosario)

tablas de parámetros por tier (rangos exactos de ICD, stamina cost, etc.)

ejemplos de 10 máscaras common/rare reales + 10 parches reales ya escritos en JSON.
Configuración recomendada (lista para poner en la web/whitepaper)
Ranked (competitivo)

Duel (1v1) — 2 jugadores (modo principal al inicio)

Tag Team (2v2) — 4 jugadores (cuando el core esté balanceado)

Trios (3v3) — 6 jugadores (opcional, fase posterior)

Casual / Party

Brawl FFA (6–8) — 6 a 8 jugadores (límite recomendado)

Mega Brawl (8–12) — 8 a 12 (modo “evento”; no siempre activo)

Hub / Social (no competitivo)

Arena Lobby (20–50) — 20 a 50 jugadores (sin combate serio; exhibición, tienda, matchmaking, minijuegos)

Lo que yo haría como roadmap (para no romper el proyecto)

Fase 1 (MVP): 1v1 + Lobby 30
Fase 2: 2v2 + FFA 8
Fase 3: 3v3 o Mega Brawl 12 (solo si el netcode ya está sólido)

Esto te deja lanzar rápido y balancear parches/máscaras sin caos.

Reglas técnicas para que funcione en arena 3D (muy importante)
1) Autoridad del servidor (obligatorio)

El servidor decide: hit confirm, daño, cooldowns, stamina, knockback

El cliente solo envía inputs (movimiento/ataque)

2) Tickrate recomendado

1v1 / 2v2: 30–60 tick (ideal 60 si puedes)

FFA 8: 30 tick suele ser suficiente

Lobby 30: 10–20 tick (porque no es combate serio)

3) Ancho de banda / rendimiento (la razón de los límites)

1v1 y 2v2 son estables y “limpios”

En FFA 12 crecen:

colisiones/hit events

cámaras y claridad visual

focus-fire (balance)

latencia percibida

Por eso FFA 6–8 es el “punto dulce”.

Sugerencia de reglas de matchmaking (para que sea justo con NFTs)

Ranked 1v1: solo builds validadas (tier match, slots por nivel, etc.)

Casual: permite más libertad, pero siempre con caps

Lobby: nada que afecte ranking (solo social)

¿Quieres que lo meta ya en tu landing page?

Puedo agregarte una sección tipo “Game Modes” con el mismo estilo de póster (y un mini diagrama) en inglés, por ejemplo:

Ranked: Duel (1v1), Tag Team (2v2), Trios (3v3)

Casual: Brawl FFA (6–8), Mega Brawl (8–12)

Social: Arena Lobby (20–50)

Si me confirmas “sí, agrégalo”, lo integro al HTML y te devuelvo los archivos actualizados.
Buena duda — aquí la respuesta “de diseño” (porque tú decides la política de emisión, no hay un número obligatorio).

Máscaras (NFT)

Como ya definiste 1000 máscaras, lo más limpio es:

Máscaras vendibles / minteables: 1000 (Genesis)

Y listo. No vuelvas a mintear máscaras “Genesis” nunca.

Si en el futuro quieres expandir el universo sin devaluar Genesis, lo normal es sacar “Season 1 Masks” como colección aparte (con reglas/arte distintos), pero Genesis se queda en 1000.

✅ Recomendación: 1000 total (fijo) para que sea coleccionable y claro.

Parches (NFT, consumibles de 1 uso)

Aquí NO conviene fijar un número total para siempre, porque tus parches son one-time equip (se consumen). Eso significa que necesitas un “sink” + reposición a lo largo del tiempo, si no el mercado se seca.

Lo que manda es: cuántos parches se “queman” en promedio

Con tu sistema de slots, el “máximo teórico” de parches equipables (si todos los NFTs se usaran al máximo) es:

Common: 700 máscaras × 1 slot = 700

Rare: 250 × 2 slots = 500

Legendary: 50 × 3 slots = 150
Total slots = 1350 parches (equipados una vez)

Pero en la práctica se queman muchos más porque:

la gente cambia de build

habrá metas, updates, nuevos parches

los jugadores nuevos van consumiendo también

✅ Por eso lo sano es emitir parches por temporadas.

Recomendación realista (números concretos)
Season 0 (lanzamiento / primer año)

25,000 parches en total

Common patches: 17,500 (70%)

Rare patches: 6,250 (25%)

Legendary patches: 1,250 (5%)

Esto mantiene rareza consistente con tus tiers, pero asegura liquidez para builds y mercado.

Luego (reposición)

Cada temporada (ej. cada 3 meses): 5,000–12,000 parches nuevos

Si el juego crece rápido → más cerca de 12k

Si es nicho al inicio → más cerca de 5k

Regla clave para que no parezca P2W

Aunque vendas parches, define un techo claro:

“A player can only equip at most X patches per match (según slots), and patches follow tier restrictions.”

Y siempre con caps/tradeoffs (como ya lo planteamos).

Resumen final (recomendado)

Máscaras: 1000 total (Genesis, fijo)

Parches: no fijos “para siempre”; emitir por temporadas

Season 0: 25,000 (70/25/5)

Temporadas: 5k–12k según demanda

Si quieres, te hago un mini “tokenomics” simple (sin humo) con:

cuántos parches salen por día/semana

qué % va a tienda vs rewards

cómo mantener precios estables sin inflar supply.