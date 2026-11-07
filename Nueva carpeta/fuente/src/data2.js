
/* ===== Ampliación de contenido (v2) ===== */
Object.assign(MECH,{
 carga:'Levantar o frenar una carga pesada',
 hiperext:'Dedo gordo forzado hacia arriba (hiperextensión)',
 latigazo:'Latigazo o sacudida brusca de la cabeza'
});
Object.assign(SX,{
 ac_dolor:'Dolor en la punta del hombro (acromioclavicular)',
 dolor_radial:'Dolor en el borde del pulgar de la muñeca al agarrar',
 dedo_caido:'La punta del dedo cae y no se puede estirar sola',
 dolor_sentado:'Dolor al estar sentado mucho rato',
 ciatica:'Dolor que baja por la pierna por debajo de la rodilla',
 dolor_dedo_gordo:'Dolor en la base del dedo gordo',
 dolor_cuello:'Dolor o rigidez en el cuello'
});

const DOSE2={
 iso:[{s:5,t:30,note:'esfuerzo 30–50 %'},{s:5,t:45,note:'esfuerzo 50–70 %'},{s:5,t:45,note:'esfuerzo 70–90 %'}],
 fuerza:[{s:3,r:'12–15',note:'tempo 3-1-3 · RIR 4'},{s:4,r:'8–10',note:'carga moderada · RIR 2–3'},{s:4,r:'5–6',note:'carga alta · RIR 1–2'}],
 movil:[{s:2,r:'10',note:'sin dolor'},{s:3,r:'12',note:'rango progresivo'},{s:3,r:'15',note:'rango completo + 20 s al final'}],
 neuro:[{s:3,t:30,note:'superficie estable'},{s:3,t:45,note:'superficie inestable'},{s:3,t:45,note:'perturbaciones o doble tarea'}],
 plio:[{s:2,r:'8',note:'bajo impacto'},{s:3,r:'8–10',note:'intensidad moderada'},{s:4,r:'6–8',note:'máxima calidad reactiva'}],
 cardio:[{s:1,min:15,note:'suave (RPE 3–4)'},{s:1,min:25,note:'moderado (RPE 5–6)'},{s:1,min:30,note:'con intervalos (RPE 7–8)'}],
 espec:[{s:1,min:10,note:'técnica a baja intensidad'},{s:1,min:20,note:'60–75 % de intensidad'},{s:1,min:30,note:'80–100 % · gestos de competición'}]
};
const REST={iso:60,fuerza:[60,90,120],movil:20,neuro:30,plio:90,cardio:0,espec:0};

Object.assign(EX,{
 neck_flex:{n:'Flexores profundos del cuello (chin tuck)',t:'iso',v:['Tumbado, 10 s por repetición','Sentado con resistencia de la mano','Tumbado con la cabeza elevada'],c:'Mete el mentón sin levantar la cabeza; cuello largo.'},
 neck_iso:{n:'Isometría cervical en 4 direcciones',t:'iso',v:['Con la mano, al 30 %','Con la mano, al 50–70 %','Con banda elástica'],c:'Sin mover la cabeza; dolor ≤ 3/10.'},
 side_plank:{n:'Plancha lateral',t:'iso',v:['Sobre rodillas','Completa','Completa con abducción de la pierna'],c:'Cadera alta y alineada con hombros y pies.'},
 hip_abd:{n:'Abducción de cadera en carga',t:'fuerza',v:['De pie con apoyo','Con banda en los tobillos','Paso lateral con banda en media sentadilla'],c:'Pelvis nivelada; evita cruzar las piernas.'},
 bicep:{n:'Curl de bíceps con supinación',t:'fuerza',v:['Isometría con el codo a 90°','Mancuerna ligera','Mancuerna con supinación contra resistencia'],c:'Codo pegado al cuerpo; sin dolor en la flexura.'},
 wrist_flex:{n:'Flexores y pronadores de muñeca',t:'fuerza',v:['Isometría contra la otra mano','Excéntrico con mancuerna ligera','Barra flexible (Tyler inverso)'],c:'Para el codo de golfista; dolor ≤ 3/10.'},
 thumb:{n:'Fuerza del pulgar y desviación radial',t:'fuerza',v:['Isometría en pinza','Abducción del pulgar con goma','Desviación radial con mancuerna'],c:'Sin forzar la desviación cubital al principio.'},
 finger_ext:{n:'Extensión activa del dedo',t:'movil',v:['Sujetando la falange media','Activa libre','Contra la resistencia de una goma'],c:'Solo cuando el médico autorice retirar la férula.'},
 toe_mob:{n:'Movilidad del dedo gordo',t:'movil',v:['Pasiva suave','Activa','En carga (estocada de puntillas)'],c:'Progresa la extensión sin dolor.'},
 nerve_glide:{n:'Deslizamiento neural',t:'movil',v:['Slump sentado suave','Slump con extensión de rodilla','De pie con flexión de tronco'],c:'Movimiento suave; no debe aumentar el dolor irradiado.'},
 prone_press:{n:'Extensión lumbar en prono',t:'movil',v:['Apoyo en antebrazos','Extensión con brazos','Extensión con presión final'],c:'Si el dolor de pierna se centraliza, continúa; si se irradia más, para.'},
 splint:{n:'Férula o inmovilización indicada',t:'prot',v:['','',''],c:'Mantenerla según la indicación médica; no retirarla para probar.'},
 sling:{n:'Cabestrillo según tolerancia',t:'prot',v:['','',''],c:'Retirarlo de forma progresiva a medida que el dolor lo permita.'}
});

/* Material por ejercicio y nivel: n = nada, b = banda, m = mancuernas o peso, c = escalón/cajón/banco, g = gimnasio. "c+m" = ambos */
const EQN={n:'Sin material',b:'Banda elástica',m:'Mancuernas o peso',c:'Escalón, cajón o banco',g:'Gimnasio (máquinas y barra)'};
const EQ={
 slr:['n','m','m'],tke:['b','b','b'],squat:['n','m','g'],split_squat:['n','c','c+m'],step_up:['c','c+m','c'],leg_press:['g','g','g'],
 decline_squat:['c','c','c+m'],spanish_squat:['b','b','b+m'],hip_bridge:['n','n','m'],clam:['b','m','n'],copenhagen:['c','c','c'],
 iso_ham:['n','c','c'],rdl:['n','m','m'],nordic:['b','n','m'],calf_raise:['n','c','c+m'],ecc_calf:['c','c','c+m'],calf_iso:['n','n','m'],
 band_ankle:['b','b','b'],rathleff:['c','c','c+m'],landing:['c','c','c'],bike:['g','g','g'],er_band:['b','b','b'],row:['b','m','g'],
 ytw:['n','m','m'],plyo_sh:['m','m','m'],wall_slide:['n','b','n'],wrist_ecc:['m','m','m'],bicep:['n','m','m'],wrist_flex:['n','m','m'],
 thumb:['n','b','m'],hip_abd:['n','b','b'],neck_iso:['n','n','b'],er_iso:['n','n','n']
};
/* Grupos para sustituir ejercicios (por dolor o por falta de material) */
const GROUPS={
 cuadriceps:['quad_set','wall_sit','spanish_squat','squat','split_squat','step_up','leg_press','tke','decline_squat','slr'],
 posterior:['iso_ham','hip_bridge','ham_slider','rdl','askling','nordic'],
 cadera:['clam','hip_abd','side_plank','copenhagen','add_squeeze','hip_bridge'],
 gemelo:['calf_iso','calf_raise','ecc_calf','rathleff'],
 tobillo:['band_ankle','ankle_mob','balance','star','foot_intr','plantar_str','toe_mob'],
 movrodilla:['heel_slide','prone_hang'],
 hombro:['er_iso','er_band','row','ytw','pushup_plus','cc_shoulder','wall_slide','pendulum'],
 brazo:['wrist_iso','wrist_ecc','grip','wrist_mob','bicep','wrist_flex','thumb','finger_ext'],
 tronco:['plank','bird_dog','dead_bug','cat_camel','side_plank','prone_press','nerve_glide'],
 cuello:['neck_flex','neck_iso'],
 cardio:['run','bike'],
 pliometria:['pogo','landing','plyo_sh','agility']
};

TESTS.push(
{id:'cross_body',n:'Aducción cruzada (cross-body)',z:'hombro',p:'Llevar el brazo a 90° de flexión y cruzarlo hacia el hombro contrario.',pos:'Dolor en la articulación acromioclavicular.',s:'77',e:'79',dx:'Lesión acromioclavicular'},
{id:'palp_ac',n:'Palpación acromioclavicular',z:'hombro',p:'Palpar la articulación en la punta del hombro comparando ambos lados.',pos:'Dolor localizado o escalón.',s:'96',e:'10',dx:'Lesión acromioclavicular (negativa ayuda a descartar)'},
{id:'hook',n:'Hook test',z:'codo',p:'Codo a 90° y antebrazo en supinación; intentar enganchar el tendón del bíceps con el dedo desde el lado externo.',pos:'No se puede enganchar el tendón.',s:'100',e:'100',dx:'Rotura completa del bíceps distal (estudio original)'},
{id:'flex_res',n:'Flexión y pronación resistidas',z:'codo',p:'Codo extendido; resistir la flexión de muñeca y la pronación.',pos:'Dolor en el epicóndilo medial.',s:'—',e:'—',dx:'Epicondilalgia medial'},
{id:'palp_epi',n:'Palpación del epicóndilo medial',z:'codo',p:'Palpar justo por delante y debajo del epicóndilo medial.',pos:'Dolor localizado.',s:'—',e:'—',dx:'Epicondilalgia medial'},
{id:'finkelstein',n:'Finkelstein / Eichhoff',z:'muneca',p:'Pulgar dentro del puño y desviación cubital de la muñeca (Eichhoff); en Finkelstein el examinador tracciona el pulgar.',pos:'Dolor en el borde radial de la muñeca.',s:'—',e:'—',dx:'De Quervain (Eichhoff da más falsos positivos)'},
{id:'mallet_obs',n:'Extensión activa de la falange distal',z:'muneca',p:'Sujetar la falange media y pedir que estire la punta del dedo.',pos:'No puede extenderla activamente.',s:'—',e:'—',dx:'Dedo en martillo'},
{id:'cajon_post',n:'Cajón posterior',z:'rodilla',p:'Rodilla a 90° con el pie fijo; empujar la tibia hacia atrás.',pos:'Desplazamiento posterior aumentado.',s:'90',e:'99',dx:'Rotura del LCP'},
{id:'sag',n:'Signo de hundimiento posterior (sag)',z:'rodilla',p:'Caderas y rodillas a 90° con los talones sostenidos; mirar el perfil de las tibias.',pos:'La tibia afectada se hunde hacia atrás.',s:'79',e:'100',dx:'Rotura del LCP'},
{id:'stance30',n:'Apoyo unipodal 30 s',z:'cadera',p:'De pie sobre la pierna afectada 30 s, con un dedo apoyado en la pared.',pos:'Reproduce el dolor lateral de cadera.',s:'≈100',e:'≈97',dx:'Tendinopatía glútea (estudio pequeño; confirmar con palpación)'},
{id:'palp_troc',n:'Palpación del trocánter mayor',z:'cadera',p:'Decúbito lateral; palpar la cara lateral del trocánter.',pos:'Dolor localizado.',s:'≈80',e:'baja',dx:'Dolor trocantéreo (negativa ayuda a descartar)'},
{id:'puranen',n:'Puranen-Orava',z:'muslo',p:'De pie, con el pie sobre una camilla y la rodilla extendida; inclinar el tronco hacia delante.',pos:'Dolor en la tuberosidad isquiática.',s:'76',e:'82',dx:'Tendinopatía proximal de isquiotibiales'},
{id:'crossed_slr',n:'Lasègue cruzado',z:'lumbar',p:'Elevar la pierna sana con la rodilla extendida.',pos:'Reproduce el dolor en la pierna afectada.',s:'≈28',e:'≈90',dx:'Hernia discal lumbar (positivo apoya)'},
{id:'ever_res',n:'Eversión resistida',z:'tobillo',p:'Resistir la eversión del pie desde flexión plantar.',pos:'Dolor o debilidad detrás del maléolo externo.',s:'—',e:'—',dx:'Tendinopatía de peroneos'},
{id:'palp_per',n:'Palpación retromaleolar externa',z:'tobillo',p:'Palpar los tendones peroneos detrás y debajo del maléolo externo, también al mover el pie.',pos:'Dolor o chasquido del tendón.',s:'—',e:'—',dx:'Tendinopatía o luxación de peroneos'},
{id:'palp_5mtt',n:'Palpación de la base del 5.º metatarsiano',z:'pie',p:'Palpar la prominencia ósea en el borde externo del pie.',pos:'Dolor óseo localizado.',s:'—',e:'—',dx:'Fractura de la base del 5.º metatarsiano (regla de Ottawa del pie)'},
{id:'mtp_stress',n:'Estrés en extensión de la 1.ª metatarsofalángica',z:'pie',p:'Extender pasivamente el dedo gordo y comparar con el lado sano.',pos:'Dolor o laxitud aumentada.',s:'—',e:'—',dx:'Lesión de la placa plantar (turf toe)'},
{id:'ccr',n:'Regla canadiense de la columna cervical',z:'cuello',p:'Factores de alto riesgo (edad ≥ 65, mecanismo peligroso, parestesias), factores de bajo riesgo y capacidad de rotar 45° a cada lado.',pos:'Indica imagen si hay alto riesgo, no hay bajo riesgo o no rota 45°.',s:'≈99',e:'≈45',dx:'Descarta lesión cervical importante cuando es negativa'},
{id:'spurling',n:'Spurling',z:'cuello',p:'Extensión, inclinación y rotación del cuello hacia el lado afectado con compresión axial suave.',pos:'Reproduce el dolor irradiado al brazo.',s:'≈50',e:'≈93',dx:'Radiculopatía cervical (positivo apoya)'},
{id:'distraccion',n:'Distracción cervical',z:'cuello',p:'Supino; traccionar suavemente la cabeza.',pos:'Alivia el dolor irradiado.',s:'44',e:'90',dx:'Radiculopatía cervical'}
);

INJ.push(
{id:'acromio',n:'Esguince acromioclavicular',z:['hombro'],
 d:'Lesión de la articulación entre la clavícula y el acromion al caer sobre la punta del hombro. Frecuente en rugby, ciclismo, judo y esquí.',
 mech:{caida:3,impacto:3},sx:{ac_dolor:3,hematoma:1,debilidad:1,dolor_arco:1},tests:['palp_ac','cross_body','obrien'],
 img:'Radiografía con proyección de Zanca si hay deformidad; clasificación de Rockwood (tipos I a VI). Los tipos IV a VI, y algunos III en lanzadores, se valoran para cirugía.',
 g:[{n:'Tipo I–II',w:[1,1,2,2],d:'Sin desplazamiento o leve.'},{n:'Tipo III conservador',w:[2,2,3,3],d:'Escalón visible.'},{n:'Quirúrgico (IV–VI)',w:[4,4,6,6],d:'Derivar a traumatología.'}],
 ph:[
  {g:['Controlar el dolor','Mantener la movilidad sin cargar el hombro'],ex:['sling','pendulum','er_iso','grip'],cr:['Dolor en reposo ≤ 2/10','Elevación activa a 90° sin dolor']},
  {g:['Movilidad completa','Fuerza de manguito y escápula'],ex:['wall_slide','er_band','row','ytw'],cr:['Rango activo completo','Aducción cruzada indolora o casi']},
  {g:['Fuerza en cadena cerrada','Tolerar apoyos'],ex:['pushup_plus','cc_shoulder','er_band','row'],cr:['Fuerza ≥ 90 % del lado sano','Flexiones sin dolor']},
  {g:['Contacto y caídas'],ex:['plyo_sh','gesto','cc_shoulder'],cr:['Contacto y caídas sin dolor']}],
 rts:['Rango completo sin dolor','Fuerza ≥ 90 % del lado sano','Tolera el contacto'],
 prev:'Técnica de caída y placaje; hombreras en deportes de contacto.'},
{id:'biceps_dist',n:'Rotura del bíceps distal',z:['codo'],
 d:'Rotura del tendón del bíceps en el codo al frenar una carga pesada con el codo flexionado. Requiere valoración traumatológica en pocos días.',
 mech:{carga:3,caida:1},sx:{chasquido:3,defecto_palpable:3,debilidad:3,hematoma:2,dolor_anterior:2},tests:['hook'],
 img:'Ecografía o resonancia. Valoración por traumatología en la primera semana: la reparación precoz (antes de 2–3 semanas) da mejores resultados.',
 g:[{n:'Reparación quirúrgica',w:[2,4,6,8],d:''},{n:'Conservador',w:[2,3,4,4],d:'Rotura parcial o baja demanda.'}],
 ph:[
  {g:['Proteger la reparación','Movilidad de muñeca y mano'],ex:['splint','grip','wrist_mob','er_iso'],cr:['Herida cerrada si hubo cirugía','Extensión de codo progresando según el protocolo']},
  {g:['Rango completo de codo y supinación'],ex:['wrist_mob','grip','row','bicep'],cr:['Rango de codo completo','Supinación activa completa']},
  {g:['Fuerza de flexión y supinación'],ex:['bicep','row','pushup_plus','wrist_ecc'],cr:['Fuerza de flexión ≥ 80 % del lado sano']},
  {g:['Gesto deportivo'],ex:['plyo_sh','gesto','bicep'],cr:['Fuerza ≥ 90 % del lado sano','Gesto deportivo sin dolor']}],
 rts:['Fuerza de flexión y supinación ≥ 90 %','Alta de traumatología'],
 prev:'Técnica en levantamientos pesados; evitar cargas excéntricas máximas con fatiga.'},
{id:'epitroclea',n:'Epicondilalgia medial (codo de golfista)',z:['codo'],
 d:'Dolor en la cara interna del codo por sobrecarga de los flexores y pronadores de la muñeca. Frecuente en golf, escalada, lanzamiento y pádel.',
 mech:{sobreuso:3,lanzamiento:2},sx:{dolor_medial:3,dolor_progresivo:2,debilidad:1,entumecimiento:1},tests:['flex_res','palp_epi','moving_valgus'],
 img:'Clínico. Descartar lesión del ligamento colateral cubital y afectación del nervio cubital (hormigueo en 4.º y 5.º dedos).',
 g:[{n:'Estándar',w:[2,4,4,2],d:'Puede tardar de 3 a 6 meses.'}],
 ph:[
  {g:['Reducir el dolor','Ajustar el volumen del gesto'],ex:['wrist_flex','grip','row'],cr:['Prensión sin dolor ≥ 60 % del lado sano']},
  {g:['Fuerza de flexores y pronadores'],ex:['wrist_flex','grip','wrist_mob','er_band'],cr:['Prensión sin dolor ≥ 80 % del lado sano']},
  {g:['Fuerza y velocidad'],ex:['wrist_flex','grip','row','plyo_sh'],cr:['Golpes o swings suaves sin dolor']},
  {g:['Volumen del deporte'],ex:['gesto','grip'],cr:['Volumen de juego completo sin dolor']}],
 rts:['Prensión sin dolor ≥ 90 %','Volumen de juego completo'],
 prev:'Técnica y fuerza de antebrazo; progresión gradual del volumen.'},
{id:'dequervain',n:'Tenosinovitis de De Quervain',z:['muneca'],
 d:'Inflamación de los tendones del pulgar en el borde radial de la muñeca por movimientos repetidos de agarre y desviación. Frecuente en remo, golf, deportes de raqueta y crianza.',
 mech:{sobreuso:3},sx:{dolor_radial:3,dolor_progresivo:2,dolor_tabaquera:1},tests:['finkelstein','tabaquera'],
 img:'Clínico; ecografía si hay dudas. Si hubo caída, descartar fractura de escafoides.',
 g:[{n:'Estándar',w:[2,2,3,2],d:'Férula de pulgar las primeras semanas.'}],
 ph:[
  {g:['Reposo relativo con férula','Ajustar el gesto'],ex:['splint','wrist_mob','grip'],cr:['Dolor en la vida diaria ≤ 2/10']},
  {g:['Fuerza suave del pulgar'],ex:['thumb','wrist_mob','grip'],cr:['Finkelstein indoloro o casi']},
  {g:['Fuerza progresiva'],ex:['thumb','wrist_ecc','grip'],cr:['Prensión sin dolor ≥ 80 % del lado sano']},
  {g:['Gesto deportivo'],ex:['gesto','thumb'],cr:['Gestos del deporte sin dolor']}],
 rts:['Prensión sin dolor ≥ 90 %','Gestos del deporte sin dolor'],
 prev:'Variar el agarre y repartir la carga entre ambas manos.'},
{id:'mallet',n:'Dedo en martillo',z:['muneca'],
 d:'Lesión del tendón extensor en la punta del dedo por un pelotazo. La punta queda caída. Se trata con férula en extensión continua.',
 mech:{impacto:3},sx:{dedo_caido:3,hematoma:1},tests:['mallet_obs'],
 img:'Radiografía para ver si hay fragmento óseo. Férula en extensión continua 6–8 semanas: si la punta se dobla, el plazo vuelve a empezar.',
 g:[{n:'Tendinoso (férula)',w:[6,2,2,1],d:''},{n:'Con fragmento óseo',w:[6,2,2,1],d:'Cirugía si el fragmento es grande o hay subluxación.'}],
 ph:[
  {g:['Férula continua en extensión'],ex:['splint','wrist_mob'],cr:['Férula sin retirar','Sin caída de la punta al revisar']},
  {g:['Retirada progresiva de la férula'],ex:['finger_ext','splint'],cr:['Extensión activa sin caída']},
  {g:['Movilidad y prensión'],ex:['finger_ext','grip'],cr:['Puño completo sin dolor']},
  {g:['Volver al balón'],ex:['gesto','grip'],cr:['Recibe y lanza sin dolor']}],
 rts:['Extensión activa completa','Puño completo'],
 prev:'Vendaje o férula protectora al volver a deportes de balón.'},
{id:'lcp',n:'Lesión del ligamento cruzado posterior (LCP)',z:['rodilla'],
 d:'Lesión del ligamento que impide que la tibia se desplace hacia atrás, por un golpe en la tibia con la rodilla flexionada o al caer sobre ella.',
 mech:{impacto:3,caida:2},sx:{dolor_posterior:2,derrame_lento:2,inestabilidad:1,hematoma:1},tests:['cajon_post','sag','barrido'],
 img:'Resonancia magnética. Las lesiones aisladas suelen tratarse sin cirugía; las combinadas (esquina posterolateral) requieren especialista.',
 g:[{n:'Aislada, conservador',w:[2,3,4,3],d:''},{n:'Reconstrucción',w:[4,6,8,10],d:''}],
 ph:[
  {g:['Evitar el hundimiento posterior de la tibia','Cuádriceps activo'],ex:['quad_set','slr','heel_slide','calf_raise'],cr:['Extensión completa','Marcha sin cojera','Derrame mínimo (barrido ≤ 1+)']},
  {g:['Fuerza de cuádriceps','Evitar isquiotibiales aislados contra resistencia'],ex:['leg_press','squat','wall_sit','hip_bridge','balance','bike'],cr:['Flexión ≥ 120°','Equilibrio unipodal 30 s']},
  {g:['Fuerza unilateral','Carrera'],ex:['split_squat','step_up','star','run','landing'],cr:['LSI de cuádriceps ≥ 80 %','Trote 20 min sin dolor']},
  {g:['Saltos y cambios de dirección'],ex:['pogo','agility','landing','run'],cr:['LSI de fuerza y saltos ≥ 90 %']}],
 rts:['LSI ≥ 90 % en fuerza y saltos','Sin derrame ni inestabilidad'],
 prev:'Fuerza de cuádriceps; rodilleras en deportes con caídas sobre la rodilla.'},
{id:'condral',n:'Lesión condral u osteocondral',z:['rodilla'],
 d:'Daño del cartílago articular por un golpe, un giro o sobrecarga. Da derrame recurrente, dolor con la carga y a veces bloqueos.',
 mech:{torsion:2,impacto:2,sobreuso:2},sx:{derrame_lento:3,bloqueo:2,dolor_progresivo:2,dolor_linea:1},tests:['barrido','linea_art'],
 img:'Resonancia magnética. Fragmentos sueltos o bloqueo: traumatología preferente. La cirugía de cartílago cambia mucho los plazos.',
 g:[{n:'Conservador',w:[2,4,4,4],d:''},{n:'Tras cirugía de cartílago',w:[6,6,8,10],d:''}],
 ph:[
  {g:['Controlar el derrame','Recuperar la movilidad'],ex:['quad_set','slr','heel_slide','bike'],cr:['Derrame mínimo (barrido ≤ 1+)','Extensión completa']},
  {g:['Fuerza sin impacto'],ex:['leg_press','wall_sit','hip_bridge','balance','bike'],cr:['Sin derrame tras las sesiones','Flexión ≥ 120°']},
  {g:['Fuerza unilateral','Carrera'],ex:['squat','split_squat','step_up','run'],cr:['Trote 20 min sin derrame','LSI de cuádriceps ≥ 80 %']},
  {g:['Impacto y saltos'],ex:['pogo','landing','agility'],cr:['LSI de fuerza y saltos ≥ 90 %','Sin derrame tras el impacto']}],
 rts:['Sin derrame tras entrenar','LSI ≥ 90 % en fuerza y saltos'],
 prev:'Fuerza de cuádriceps y gestión del volumen de impacto.'},
{id:'glutea',n:'Tendinopatía glútea (dolor trocantéreo)',z:['cadera'],
 d:'Dolor en la cara externa de la cadera por compresión y sobrecarga de los tendones del glúteo medio y menor. Duele al dormir sobre ese lado, subir escaleras y estar de pie sobre una pierna.',
 mech:{sobreuso:3},sx:{dolor_lateral:3,dolor_nocturno:2,dolor_escaleras:2,dolor_progresivo:1},tests:['stance30','palp_troc','faber'],
 img:'Clínico; ecografía si hay dudas.',
 g:[{n:'Estándar',w:[2,4,4,2],d:'Educación sobre posturas de compresión + ejercicio.'}],
 ph:[
  {g:['Evitar cruzar las piernas y dormir sobre ese lado sin almohada','Isometría de abductores'],ex:['hip_abd','hip_bridge','bike'],cr:['Dolor matutino ≤ 3/10']},
  {g:['Fuerza de abductores en carga'],ex:['hip_abd','side_plank','squat','step_up','hip_bridge'],cr:['Fuerza de cadera ≥ 80 %']},
  {g:['Fuerza unilateral','Carrera'],ex:['split_squat','step_up','side_plank','run'],cr:['Trote 20 min sin dolor']},
  {g:['Volumen habitual'],ex:['run','pogo','agility'],cr:['Volumen habitual sin dolor']}],
 rts:['Volumen habitual sin dolor','Fuerza de abductores ≥ 90 %'],
 prev:'Fuerza de abductores y gestión del volumen de carrera y cuestas.'},
{id:'isq_prox',n:'Tendinopatía proximal de isquiotibiales',z:['muslo','cadera'],
 d:'Dolor profundo en la nalga, junto al hueso isquion, que empeora al estar sentado, correr cuesta arriba o estirar. Frecuente en corredores y deportes de velocidad.',
 mech:{sobreuso:3,aceleracion_sprint:1},sx:{dolor_posterior:3,dolor_sentado:3,dolor_progresivo:2},tests:['bent_knee','puranen','palp_isq'],
 img:'Clínico; resonancia si hay dudas o sospecha de avulsión.',
 g:[{n:'Estándar',w:[2,4,6,4],d:''}],
 ph:[
  {g:['Evitar estirar y la flexión de cadera profunda con carga','Isometría'],ex:['iso_ham','hip_bridge','bike'],cr:['Dolor matutino ≤ 3/10']},
  {g:['Fuerza en rangos medios'],ex:['hip_bridge','rdl','ham_slider','step_up'],cr:['Puente unipodal 20 repeticiones sin dolor']},
  {g:['Fuerza en rango largo','Carrera'],ex:['rdl','nordic','split_squat','run'],cr:['Peso muerto rumano con carga sin dolor a 24 h','Trote 20 min sin dolor']},
  {g:['Velocidad y cuestas'],ex:['run','agility','askling'],cr:['Sprints y cuestas sin dolor']}],
 rts:['Sprints y cuestas sin dolor','Fuerza de isquiotibiales ≥ 90 %'],
 prev:'Fuerza de isquiotibiales y progresión gradual de cuestas y velocidad.'},
{id:'hernia',n:'Hernia discal con dolor irradiado (ciática)',z:['lumbar'],
 d:'Dolor lumbar con dolor que baja por la pierna por debajo de la rodilla, a veces con hormigueo. Casi siempre mejora con tratamiento conservador.',
 mech:{carga:2,sobreuso:1,torsion:1},sx:{ciatica:3,entumecimiento:2,dolor_lumbar:2,debilidad:1},tests:['slr','slump','crossed_slr'],
 img:'Resonancia solo si hay déficit neurológico progresivo, signos de alarma, o si no mejora en 6–8 semanas y se plantea cirugía o infiltración.',
 g:[{n:'Conservador',w:[2,3,4,3],d:''},{n:'Tras cirugía',w:[2,4,4,4],d:''}],
 ph:[
  {g:['Mantenerse activo caminando','Buscar posiciones que centralicen el dolor'],ex:['prone_press','nerve_glide','cat_camel','run'],cr:['El dolor de pierna se reduce o centraliza','Camina 20 min']},
  {g:['Control del tronco'],ex:['dead_bug','bird_dog','hip_bridge','nerve_glide'],cr:['Lasègue negativo o mejorando','Sin pérdida de fuerza']},
  {g:['Carga progresiva'],ex:['rdl','squat','plank','side_plank'],cr:['Plancha 60 s sin dolor','Carga progresiva sin dolor irradiado']},
  {g:['Gestos del deporte'],ex:['run','agility','rdl'],cr:['Entrenamiento completo sin dolor irradiado']}],
 rts:['Sin dolor irradiado con el entrenamiento','Fuerza normal'],
 prev:'Fuerza general y progresión gradual de cargas.'},
{id:'peroneos',n:'Tendinopatía de peroneos',z:['tobillo'],
 d:'Dolor detrás del maléolo externo por sobrecarga de los tendones peroneos. Frecuente tras esguinces repetidos y en corredores de montaña.',
 mech:{sobreuso:3,inversion:1},sx:{dolor_lateral:3,dolor_progresivo:2,inestabilidad:1},tests:['ever_res','palp_per'],
 img:'Ecografía dinámica si hay chasquido (posible luxación de los tendones).',
 g:[{n:'Estándar',w:[1,3,4,2],d:''}],
 ph:[
  {g:['Reducir la carga irritante','Isometría'],ex:['band_ankle','calf_iso','balance','bike'],cr:['Dolor matutino ≤ 3/10']},
  {g:['Fuerza de peroneos y gemelo'],ex:['band_ankle','calf_raise','balance','star'],cr:['20 elevaciones de talón unipodales','Equilibrio unipodal 30 s con ojos cerrados']},
  {g:['Carrera'],ex:['calf_raise','pogo','run','star'],cr:['Trote 20 min sin dolor']},
  {g:['Terreno irregular y cambios de dirección'],ex:['agility','pogo','run'],cr:['Cambios de dirección sin dolor']}],
 rts:['Terreno irregular sin dolor','Fuerza de eversión simétrica'],
 prev:'Fuerza y propiocepción del tobillo, sobre todo tras un esguince.'},
{id:'jones',n:'Fractura de la base del 5.º metatarsiano (Jones)',z:['pie'],
 d:'Fractura en el borde externo del pie por un giro o por sobrecarga. La zona de Jones consolida mal y en deportistas suele operarse.',
 mech:{inversion:2,torsion:2,sobreuso:2},sx:{dolor_lateral:3,dolor_oseo_focal:3,no_carga:2,hematoma:1},tests:['ottawa','palp_5mtt'],
 img:'Radiografía del pie. Las fracturas de Jones (zona 2) tienen riesgo de no consolidar: en deportistas suele indicarse un tornillo.',
 g:[{n:'Quirúrgico (tornillo)',w:[2,4,4,3],d:''},{n:'Conservador (descarga)',w:[6,4,4,3],d:''}],
 ph:[
  {g:['Descarga según indicación','Mantener la forma física'],ex:['splint','hip_bridge','plank','clam'],cr:['Consolidación confirmada en imagen']},
  {g:['Marcha normal','Movilidad y fuerza del tobillo'],ex:['ankle_mob','band_ankle','calf_iso','balance'],cr:['Marcha sin dolor ni bota']},
  {g:['Carrera'],ex:['calf_raise','foot_intr','run','balance'],cr:['Trote 20 min sin dolor']},
  {g:['Saltos y cambios de dirección'],ex:['pogo','agility','run'],cr:['Cambios de dirección y saltos sin dolor']}],
 rts:['Consolidación','Saltos y cambios de dirección sin dolor'],
 prev:'Progresión gradual de la carga; valorar disponibilidad energética y calzado.'},
{id:'turf_toe',n:'Esguince del dedo gordo (turf toe)',z:['pie'],
 d:'Lesión de la cápsula y placa plantar del dedo gordo al forzarlo hacia arriba con el pie apoyado. Frecuente en césped artificial.',
 mech:{hiperext:3,salto_aterrizaje:1},sx:{dolor_dedo_gordo:3,hematoma:2,no_carga:1},tests:['mtp_stress'],
 img:'Radiografía en carga; resonancia en grados II–III.',
 g:[{n:'Grado I',w:[1,1,1,1],d:''},{n:'Grado II',w:[1,2,2,2],d:''},{n:'Grado III',w:[3,3,4,4],d:''}],
 ph:[
  {g:['Calzado rígido o vendaje que limite la extensión'],ex:['splint','toe_mob','hip_bridge','bike'],cr:['Marcha sin cojera con calzado rígido']},
  {g:['Movilidad y fuerza del pie'],ex:['toe_mob','foot_intr','calf_raise','balance'],cr:['Elevaciones de talón sin dolor']},
  {g:['Carrera'],ex:['calf_raise','run','pogo'],cr:['Trote 20 min sin dolor']},
  {g:['Sprint y despegue'],ex:['agility','pogo','run'],cr:['Sprint y despegue sin dolor']}],
 rts:['Sprint y despegue sin dolor'],
 prev:'Calzado con suela rígida en césped artificial.'},
{id:'cervical',n:'Esguince cervical o dolor de cuello',z:['cuello'],
 d:'Dolor y rigidez del cuello tras una sacudida, un golpe o sobrecarga. La mayoría mejora en semanas manteniéndose activo.',
 mech:{latigazo:3,impacto:2,sobreuso:1},sx:{dolor_cuello:3,cefalea:1,entumecimiento:1,mareo:1},tests:['ccr','spurling','distraccion'],
 img:'Aplicar la regla canadiense de la columna cervical; imagen solo si la indica. Si hay hormigueo o debilidad en los brazos, valoración médica.',
 g:[{n:'Leve',w:[1,2,2,2],d:'Dolor y rigidez sin síntomas neurológicos.'},{n:'Con síntomas neurológicos',w:[2,3,4,4],d:''}],
 ph:[
  {g:['Mantenerse activo','Movilidad suave del cuello'],ex:['neck_flex','neck_iso','row'],cr:['Dolor en reposo ≤ 2/10']},
  {g:['Control de los flexores profundos y la escápula'],ex:['neck_flex','neck_iso','row','ytw','wall_slide'],cr:['Rotación cervical simétrica']},
  {g:['Fuerza cervical y de tronco'],ex:['neck_iso','row','pushup_plus','plank'],cr:['Fuerza cervical simétrica sin dolor']},
  {g:['Contacto (si el deporte lo tiene)'],ex:['gesto','neck_iso','cc_shoulder'],cr:['Contacto sin síntomas']}],
 rts:['Movilidad completa sin dolor','Sin síntomas neurológicos','Alta médica en deportes de contacto'],
 prev:'Fuerza cervical en deportes de contacto; técnica de placaje.'}
);

/* Aguda (a), sobrecarga (o) o mixta (m) */
const KIND={lca:'a',lcm:'a',menisco:'m',tend_rot:'o',pfps:'o',itb:'o',osgood:'o',esguince_lat:'a',sindesmosis:'a',aquiles_tend:'o',aquiles_rot:'a',mtss:'o',fx_estres:'o',gemelo:'a',fascitis:'o',sever:'o',isquios:'a',cuadriceps:'a',aductores:'m',fai:'o',lumbalgia:'m',espondilolisis:'o',manguito:'o',luxacion:'a',slap:'m',epicondilalgia:'o',ucl:'o',escafoides:'a',conmocion:'a',acromio:'a',biceps_dist:'a',epitroclea:'o',dequervain:'o',mallet:'a',lcp:'a',condral:'m',glutea:'o',isq_prox:'o',hernia:'m',peroneos:'o',jones:'m',turf_toe:'a',cervical:'a'};
/* Lesiones con tendencia a repetirse */
const RECUR={esguince_lat:1.5,isquios:1.5,luxacion:1.5,aductores:1.3,gemelo:1.3,lca:1.15,lumbalgia:1.2,conmocion:1.2};
const SPORTS={
 futbol:{n:'Fútbol',p:{isquios:1.35,aductores:1.35,lca:1.2,esguince_lat:1.2,cuadriceps:1.25,turf_toe:1.2,jones:1.2}},
 baloncesto:{n:'Baloncesto',p:{esguince_lat:1.35,lca:1.2,tend_rot:1.35,pfps:1.1,mallet:1.2}},
 voleibol:{n:'Voleibol',p:{tend_rot:1.4,esguince_lat:1.25,manguito:1.2,mallet:1.2}},
 running:{n:'Running',p:{mtss:1.4,fx_estres:1.35,fascitis:1.3,aquiles_tend:1.3,itb:1.4,pfps:1.2,glutea:1.2,isq_prox:1.25}},
 raqueta:{n:'Tenis o pádel',p:{epicondilalgia:1.45,gemelo:1.4,manguito:1.2,aquiles_rot:1.25,epitroclea:1.2}},
 contacto:{n:'Rugby, fútbol americano o lucha',p:{conmocion:1.35,acromio:1.4,luxacion:1.3,lcm:1.2,cervical:1.3,lcp:1.2}},
 natacion:{n:'Natación',p:{manguito:1.45,slap:1.1}},
 lanzamiento:{n:'Béisbol, balonmano o lanzamientos',p:{ucl:1.4,slap:1.3,manguito:1.2,epitroclea:1.2}},
 gimnasia:{n:'Gimnasia o danza',p:{espondilolisis:1.45,fai:1.15,aquiles_tend:1.1,fx_estres:1.15}},
 ciclismo:{n:'Ciclismo',p:{itb:1.3,pfps:1.2,lumbalgia:1.1,acromio:1.3,escafoides:1.2}},
 nieve:{n:'Esquí o snowboard',p:{lca:1.4,lcm:1.35,escafoides:1.2,acromio:1.2}},
 fuerza:{n:'Gimnasio, CrossFit o halterofilia',p:{lumbalgia:1.2,hernia:1.3,manguito:1.2,biceps_dist:1.35,tend_rot:1.1}},
 golf:{n:'Golf',p:{epitroclea:1.4,lumbalgia:1.2,dequervain:1.2}},
 otro:{n:'Otro',p:{}}
};
/* Referencias (las lesiones sin referencias quedan marcadas como pendientes de revisión) */
const REFS={
 lca:['Ardern CL et al. 2016 Consensus statement on return to sport. Br J Sports Med 2016.','van Melick N et al. Evidence-based clinical practice update: practice guidelines for ACL rehabilitation. Br J Sports Med 2016.'],
 menisco:['Kise NJ et al. Exercise therapy versus arthroscopic partial meniscectomy for degenerative meniscal tear. BMJ 2016.'],
 tend_rot:['Malliaras P et al. Patellar tendinopathy: clinical diagnosis, load management, and advice for challenging case presentations. JOSPT 2015.','Rio E et al. Isometric exercise induces analgesia and reduces inhibition in patellar tendinopathy. Br J Sports Med 2015.'],
 pfps:['Crossley KM et al. 2016 Patellofemoral pain consensus statement. Br J Sports Med 2016.','Willy RW et al. Patellofemoral pain: clinical practice guidelines. JOSPT 2019.'],
 esguince_lat:['Vuurberg G et al. Diagnosis, treatment and prevention of ankle sprains: an evidence-based clinical guideline. Br J Sports Med 2018.','Bachmann LM et al. Accuracy of Ottawa ankle rules to exclude fractures of the ankle and mid-foot. BMJ 2003.','Dubois B, Esculier JF. Soft-tissue injuries simply need PEACE and LOVE. Br J Sports Med 2020.'],
 aquiles_tend:['Alfredson H et al. Heavy-load eccentric calf muscle training for the treatment of chronic Achilles tendinosis. Am J Sports Med 1998.','Silbernagel KG et al. Continued sports activity, using a pain-monitoring model, during rehabilitation in Achilles tendinopathy. Am J Sports Med 2007.'],
 aquiles_rot:['Ochen Y et al. Operative treatment versus nonoperative treatment of acute Achilles tendon ruptures. BMJ 2019.'],
 fx_estres:['Mountjoy M et al. 2023 IOC consensus statement on relative energy deficiency in sport (REDs). Br J Sports Med 2023.'],
 fascitis:['Rathleff MS et al. High-load strength training improves outcome in patients with plantar fasciitis. Scand J Med Sci Sports 2015.'],
 isquios:['Askling CM et al. Acute hamstring injuries in Swedish elite football: L-protocol versus C-protocol. Br J Sports Med 2013.','van der Horst N et al. The preventive effect of the Nordic hamstring exercise. Am J Sports Med 2015.'],
 aductores:['Weir A et al. Doha agreement meeting on terminology and definitions in groin pain in athletes. Br J Sports Med 2015.','Harøy J et al. The Adductor Strengthening Programme prevents groin problems among male football players. Br J Sports Med 2019.'],
 fai:['Griffin DR et al. The Warwick Agreement on femoroacetabular impingement syndrome. Br J Sports Med 2016.'],
 lumbalgia:['NICE. Low back pain and sciatica in over 16s: assessment and management (NG59). 2016.'],
 hernia:['NICE. Low back pain and sciatica in over 16s: assessment and management (NG59). 2016.'],
 epicondilalgia:['Coombes BK et al. Effect of corticosteroid injection, physiotherapy, or both on lateral epicondylalgia. JAMA 2013.'],
 conmocion:['Patricios JS et al. Consensus statement on concussion in sport: the 6th International Conference on Concussion in Sport, Amsterdam 2022. Br J Sports Med 2023.'],
 manguito:['Littlewood C et al. Exercise for rotator cuff tendinopathy: a systematic review. Physiotherapy 2012.'],
 glutea:['Mellor R et al. Education plus exercise versus corticosteroid injection use versus a wait and see approach for gluteal tendinopathy (LEAP). BMJ 2018.'],
 isq_prox:['Goom TSH et al. Proximal hamstring tendinopathy: clinical aspects of assessment and management. JOSPT 2016.'],
 biceps_dist:['O’Driscoll SW et al. The hook test for distal biceps tendon avulsion. Am J Sports Med 2007.'],
 cervical:['Stiell IG et al. The Canadian C-spine rule for radiography in alert and stable trauma patients. JAMA 2001.'],
 lcp:['Rubinstein RA et al. The accuracy of the clinical examination in the setting of posterior cruciate ligament injuries. Am J Sports Med 1994.']
};
INJ.forEach(i=>{i.kind=KIND[i.id]||'m';i.ref=REFS[i.id]||[]});
/* Pruebas para descartar otras lesiones (no confirman esta) */
const DDX={lumbalgia:['slr','slump'],epitroclea:['moving_valgus'],esguince_lat:['ottawa','ybalance'],sindesmosis:['ottawa'],lca:['hop_battery'],mtss:['hop_tibia']};
INJ.forEach(i=>{i.ddx=DDX[i.id]||[];i.tests=i.tests.filter(t=>!i.ddx.includes(t))});


/* Mediciones objetivas */
const MEAS=[
 {k:'knee_ext_def',n:'Déficit de extensión de rodilla',u:'°',single:true,low:true,z:['rodilla'],h:'0 = extensión completa; anota los grados que faltan.'},
 {k:'knee_flex',n:'Flexión de rodilla',u:'°',z:['rodilla','muslo']},
 {k:'effusion',n:'Derrame (prueba de barrido)',u:'0–3',single:true,low:true,z:['rodilla'],h:'0 = sin derrame, 1 = traza, 2 = moderado, 3 = a tensión.'},
 {k:'thigh_girth',n:'Perímetro del muslo (10 cm sobre la rótula)',u:'cm',z:['rodilla','muslo']},
 {k:'quad',n:'Fuerza de cuádriceps',u:'kg o N',z:['rodilla','muslo','cadera']},
 {k:'ham',n:'Fuerza de isquiotibiales',u:'kg o N',z:['rodilla','muslo','cadera']},
 {k:'add',n:'Fuerza de aductores (squeeze)',u:'kg o mmHg',z:['cadera','muslo']},
 {k:'abd',n:'Fuerza de abductores de cadera',u:'kg o N',z:['cadera','rodilla']},
 {k:'slr_rom',n:'Elevación pasiva de pierna recta',u:'°',z:['muslo','lumbar','cadera']},
 {k:'dorsi',n:'Dorsiflexión en carga (rodilla a pared)',u:'cm',z:['tobillo','pierna','pie','rodilla']},
 {k:'calf_reps',n:'Elevaciones de talón unipodales',u:'reps',z:['tobillo','pierna','pie']},
 {k:'calf_girth',n:'Perímetro de la pantorrilla',u:'cm',z:['pierna','tobillo']},
 {k:'balance',n:'Equilibrio unipodal',u:'s',z:['tobillo','rodilla','pie','pierna','cabeza']},
 {k:'ybal_ant',n:'Y-balance anterior',u:'cm',z:['tobillo','rodilla','pie']},
 {k:'hop_single',n:'Salto simple a una pierna',u:'cm',z:['rodilla','tobillo','muslo'],hop:true},
 {k:'hop_triple',n:'Salto triple',u:'cm',z:['rodilla','tobillo','muslo'],hop:true},
 {k:'hop_cross',n:'Triple cruzado',u:'cm',z:['rodilla','tobillo','muslo'],hop:true},
 {k:'hop_6m',n:'6 m cronometrado',u:'s',inv:true,z:['rodilla','tobillo','muslo'],hop:true},
 {k:'cmj',n:'Salto vertical a una pierna',u:'cm',z:['rodilla','tobillo','muslo']},
 {k:'er',n:'Rotación externa de hombro',u:'kg o N',z:['hombro','codo']},
 {k:'ir',n:'Rotación interna de hombro',u:'kg o N',z:['hombro']},
 {k:'sh_flex',n:'Flexión activa de hombro',u:'°',z:['hombro','cuello']},
 {k:'grip',n:'Prensión sin dolor',u:'kg',z:['codo','muneca','hombro']},
 {k:'neck_rot',n:'Rotación cervical',u:'°',z:['cuello','cabeza']}
];
const MEAS_BY=Object.fromEntries(MEAS.map(m=>[m.k,m]));

/* Escalas validadas: se introducen las puntuaciones de cada ítem del formulario oficial */
const SCALES={
 koos:{n:'KOOS',full:'Knee injury and Osteoarthritis Outcome Score',z:['rodilla'],up:true,calc:'koos',subs:[{k:'dolor',n:'Dolor',i:9},{k:'sintomas',n:'Síntomas',i:7},{k:'avd',n:'Actividades diarias',i:17},{k:'deporte',n:'Deporte y ocio',i:5},{k:'cv',n:'Calidad de vida',i:4}],min:0,max:4,help:'Cada ítem de 0 (ninguno) a 4 (extremo). Puntuación por subescala de 0 a 100; mayor es mejor.'},
 ikdc:{n:'IKDC subjetivo',full:'International Knee Documentation Committee',z:['rodilla'],up:true,calc:'direct',total:{min:0,max:87},help:'Introduce la suma bruta de los ítems puntuables (0–87). Se convierte a 0–100; mayor es mejor.',conv:87},
 lysholm:{n:'Lysholm',full:'Lysholm Knee Scoring Scale',z:['rodilla'],up:true,calc:'direct',total:{min:0,max:100},help:'Puntuación total de 0 a 100; mayor es mejor.'},
 acl_rsi:{n:'ACL-RSI',full:'ACL Return to Sport after Injury',z:['rodilla'],up:true,calc:'mean10',subs:[{k:'it',n:'Ítems',i:12}],min:0,max:10,help:'12 ítems de 0 a 10 (o el ítem de 0–100 dividido entre 10). Resultado de 0 a 100; mayor es mejor.'},
 visa_p:{n:'VISA-P',full:'Victorian Institute of Sport Assessment – rótula',z:['rodilla'],up:true,calc:'visa',subs:[{k:'it',n:'Ítems',i:8}],min:0,max:10,lastMax:30,help:'Ítems 1–7 de 0 a 10 y el 8 de 0 a 30. Total de 0 a 100; mayor es mejor.'},
 visa_a:{n:'VISA-A',full:'Victorian Institute of Sport Assessment – Aquiles',z:['tobillo','pierna'],up:true,calc:'visa',subs:[{k:'it',n:'Ítems',i:8}],min:0,max:10,lastMax:30,help:'Ítems 1–7 de 0 a 10 y el 8 de 0 a 30. Total de 0 a 100; mayor es mejor.'},
 faam:{n:'FAAM',full:'Foot and Ankle Ability Measure',z:['tobillo','pie','pierna'],up:true,calc:'pct4',subs:[{k:'avd',n:'Actividades diarias',i:21},{k:'deporte',n:'Deporte',i:8}],min:0,max:4,help:'Cada ítem de 0 (incapaz) a 4 (sin dificultad); deja vacío si no aplica. Porcentaje por subescala; mayor es mejor.'},
 lefs:{n:'LEFS',full:'Lower Extremity Functional Scale',z:['rodilla','tobillo','pie','pierna','muslo','cadera'],up:true,calc:'sum',subs:[{k:'it',n:'Ítems',i:20}],min:0,max:4,help:'20 ítems de 0 (dificultad extrema) a 4 (sin dificultad). Total de 0 a 80; mayor es mejor. Cambio mínimo importante ≈ 9 puntos.'},
 hagos:{n:'HAGOS',full:'Copenhagen Hip and Groin Outcome Score',z:['cadera','muslo'],up:true,calc:'koos',subs:[{k:'sintomas',n:'Síntomas',i:7},{k:'dolor',n:'Dolor',i:10},{k:'avd',n:'Actividades diarias',i:5},{k:'deporte',n:'Deporte y ocio',i:8},{k:'actividad',n:'Actividad física',i:2},{k:'cv',n:'Calidad de vida',i:5}],min:0,max:4,help:'Cada ítem de 0 (ninguno) a 4 (extremo). Puntuación por subescala de 0 a 100; mayor es mejor.'},
 quickdash:{n:'QuickDASH',full:'Disabilities of the Arm, Shoulder and Hand (versión corta)',z:['hombro','codo','muneca'],up:false,calc:'qdash',subs:[{k:'it',n:'Ítems',i:11}],min:1,max:5,help:'11 ítems de 1 a 5; hacen falta al menos 10 respondidos. Resultado de 0 a 100; menor es mejor.'},
 odi:{n:'Oswestry (ODI)',full:'Oswestry Disability Index',z:['lumbar'],up:false,calc:'odi',subs:[{k:'it',n:'Secciones',i:10}],min:0,max:5,help:'10 secciones de 0 a 5. Resultado en % de discapacidad; menor es mejor. Cambio mínimo importante ≈ 10 puntos.'},
 ndi:{n:'Neck Disability Index',full:'Neck Disability Index',z:['cuello'],up:false,calc:'odi',subs:[{k:'it',n:'Secciones',i:10}],min:0,max:5,help:'10 secciones de 0 a 5. Resultado en %; menor es mejor.'},
 tsk11:{n:'Tampa (TSK-11)',full:'Tampa Scale of Kinesiophobia, 11 ítems',z:'all',up:false,calc:'sum',subs:[{k:'it',n:'Ítems',i:11}],min:1,max:4,help:'11 ítems de 1 a 4. Total de 11 a 44; más alto indica más miedo al movimiento.'}
};

const VALID={n:48,top1:100,top3:100,top1t:100,hn:16,htop1:69,htop3:100,htop1t:94};
