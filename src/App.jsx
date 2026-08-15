import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Search, Plus, Minus, X, Check, Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  Dumbbell, Flame, Settings as SettingsIcon, ListChecks, Footprints, Trash2,
  GripVertical, Volume2, VolumeX, Sun, Moon, Palette, Info, ArrowLeft, Droplet,
  TrendingUp, Save, Edit3, Copy, Bed
} from "lucide-react";
import * as THREE from "three";

/* ============================== BASE EXERCISE DATABASE ==============================
   ~132 real, hand-authored base exercises. The full 500-exercise library is generated
   below by applying legitimate training-variation modifiers (tempo, pause, explosive,
   isometric, single-limb, band-resisted) to eligible base moves — see EXERCISES.
======================================================================================= */
const RAW_EXERCISES = [
  ["Push-Up","home",["chest","arms","core"],"Bodyweight",1,"A foundational pressing move that builds chest, shoulder and triceps strength using just body weight.",["Hands slightly wider than shoulders","Keep body in one straight line from head to heel","Lower until chest nearly touches the floor"]],
  ["Incline Push-Up","home",["chest","arms"],"Bench or step",1,"Hands elevated on a sturdy surface, reducing load — a good entry point or chest warm-up.",["Place hands on a stable elevated edge","Keep core braced, hips level","Lower chest toward the surface with control"]],
  ["Decline Push-Up","home",["chest","shoulders","arms"],"Bench or step",2,"Feet elevated to shift more load onto the upper chest and shoulders.",["Feet up on a stable surface, hands on floor","Body stays rigid, no sagging hips","Lower until upper arms are parallel to floor"]],
  ["Diamond Push-Up","home",["arms","chest"],"Bodyweight",2,"Hands form a diamond shape under the chest, emphasising the triceps.",["Thumbs and index fingers touching","Elbows track back, not flared out","Lower chest to hands under control"]],
  ["Wide Push-Up","home",["chest"],"Bodyweight",1,"A wider hand placement biases the outer chest fibres.",["Hands well outside shoulder width","Keep elbows at roughly 45°","Full range: chest to floor, full lockout at top"]],
  ["Pike Push-Up","home",["shoulders","chest"],"Bodyweight",2,"Hips raised high to angle the press toward the shoulders — a bodyweight overhead press substitute.",["Form an inverted V with hips high","Head aims toward the floor between hands","Press back up through the shoulders"]],
  ["Chair Dip","home",["chest","arms"],"Sturdy chair",2,"Triceps and lower chest dip using a chair or low, stable edge.",["Hands on chair edge, fingers forward","Lower until elbows hit ~90°","Keep hips close to the chair as you dip"]],
  ["Plyo Push-Up","home",["chest","arms","cardio"],"Bodyweight",3,"An explosive push-up where the hands leave the floor — builds power.",["Lower under control like a normal push-up","Press explosively so hands leave the ground","Land softly with elbows slightly bent"]],
  ["Barbell Bench Press","gym",["chest","arms"],"Barbell, bench",2,"The classic compound lift for building raw chest and pressing strength.",["Grip just outside shoulder width","Lower bar to mid-chest with control","Drive feet into the floor as you press up"]],
  ["Incline Barbell Bench Press","gym",["chest","shoulders"],"Barbell, incline bench",2,"Bench set at an incline to target the upper chest.",["Set bench to 30–45°","Bar path travels to the upper chest","Keep shoulder blades pinned back"]],
  ["Dumbbell Bench Press","gym",["chest","arms"],"Dumbbells, bench",2,"Dumbbells allow a deeper stretch and independent arm control.",["Start with dumbbells over the chest","Lower until upper arms are level with torso","Press up and slightly inward"]],
  ["Incline Dumbbell Press","gym",["chest","shoulders"],"Dumbbells, incline bench",2,"Upper-chest focused pressing with a dumbbell's freer range of motion.",["Bench at 30–45°, feet flat on floor","Lower dumbbells to the sides of the chest","Press up without locking elbows hard"]],
  ["Cable Fly","gym",["chest"],"Cable machine",2,"An isolation move that stretches and squeezes the chest through a wide arc.",["Slight bend in the elbows, fixed throughout","Sweep hands together in front of chest","Control the stretch on the way back"]],
  ["Pec Deck Machine","gym",["chest"],"Pec deck machine",1,"A guided machine fly that isolates the chest with minimal technique risk.",["Sit tall, back flat against pad","Bring pads together in a hugging motion","Avoid slamming the weight stack"]],
  ["Machine Chest Press","gym",["chest","arms"],"Chest press machine",1,"A guided pressing pattern, useful for beginners or high-rep finishers.",["Adjust seat so handles sit at chest height","Press forward without locking elbows","Return with control, don't let the stack bounce"]],
  ["Parallel Bar Dip","gym",["chest","arms"],"Dip station",3,"A demanding compound push exercise for chest, triceps and shoulders.",["Lean torso forward for more chest emphasis","Lower until shoulders are level with elbows","Press back up to full arm extension"]],
  ["Superman","home",["back","core"],"Bodyweight",1,"Lying extension that strengthens the lower back and glutes.",["Lie face down, arms extended overhead","Lift chest and legs off the floor together","Hold briefly, squeezing the lower back"]],
  ["Reverse Snow Angel","home",["back","shoulders"],"Bodyweight",1,"A prone shoulder-blade movement that reinforces posture and upper back strength.",["Lie face down, arms by your sides","Sweep arms out and overhead like a snow angel","Keep chest lifted slightly off the floor"]],
  ["Towel Row","home",["back","arms"],"Towel, door anchor",1,"Simulated rowing using a towel looped around a stable anchor.",["Loop towel around a door handle or pole","Lean back, arms extended, feet braced","Pull chest toward the anchor point"]],
  ["Table Bodyweight Row","home",["back","arms"],"Sturdy table",2,"An inverted row using a sturdy table edge in place of a bar.",["Lie under a stable table, grip the edge","Keep body straight, heels on the floor","Pull chest up toward the table edge"]],
  ["Bird Dog","home",["back","core"],"Bodyweight",1,"A stability drill that trains the back and core to resist rotation.",["Start on hands and knees","Extend opposite arm and leg together","Keep hips level, avoid twisting"]],
  ["Prone Y-Raise","home",["back","shoulders"],"Bodyweight",1,"Targets the lower traps and rear delts in a Y-shaped arm position.",["Lie face down, arms forming a Y overhead","Lift arms slightly, thumbs pointing up","Squeeze shoulder blades down and together"]],
  ["Resistance Band Row","home",["back","arms"],"Resistance band",1,"A banded seated or standing row for back thickness.",["Anchor band at chest height","Pull elbows straight back, squeezing blades","Control the return, don't let it snap"]],
  ["Doorframe Row","home",["back","arms"],"Door frame",1,"Body-angle row using a stable door frame or pole as an anchor.",["Grip the frame, lean back with straight arms","Pull chest toward the frame","Lower with control to full arm extension"]],
  ["Lat Pulldown","gym",["back","arms"],"Lat pulldown machine",1,"A machine-guided pull that builds width in the back.",["Grip slightly wider than shoulders","Pull bar to upper chest, elbows down","Control the weight back to full stretch"]],
  ["Pull-Up","gym",["back","arms"],"Pull-up bar",3,"A demanding bodyweight pull that builds a strong, wide back.",["Hang with an overhand, shoulder-width grip","Pull chin above the bar","Lower with control to a full hang"]],
  ["Chin-Up","gym",["back","arms"],"Pull-up bar",3,"An underhand-grip pull-up that recruits more biceps.",["Underhand grip, shoulder-width","Pull chest toward the bar","Lower under control to full extension"]],
  ["Barbell Row","gym",["back","arms"],"Barbell",2,"A heavy compound pull for overall back thickness.",["Hinge at the hips, back flat","Pull bar to the lower ribs","Lower with control, no jerking"]],
  ["Single-Arm Dumbbell Row","gym",["back","arms"],"Dumbbell, bench",2,"Unilateral row that helps correct imbalances between sides.",["Support one knee/hand on a bench","Pull dumbbell to the hip, elbow close","Lower fully before the next rep"]],
  ["Seated Cable Row","gym",["back","arms"],"Cable row machine",1,"A controlled, seated pulling motion for the mid-back.",["Sit tall, slight lean back at the finish","Pull handle to the abdomen","Let shoulder blades protract on the stretch"]],
  ["T-Bar Row","gym",["back","arms"],"T-bar or landmine",2,"A close-grip row that loads the mid-back heavily.",["Straddle the bar, hinge forward","Pull the handle to the chest","Keep chest up, avoid rounding the spine"]],
  ["Deadlift","gym",["back","legs","full"],"Barbell",3,"A full-body pulling exercise and one of the most effective posterior-chain builders.",["Bar over mid-foot, shins close to bar","Flat back, chest up, brace the core","Drive through the floor, hips and shoulders rise together"]],
  ["Bodyweight Squat","home",["legs"],"Bodyweight",1,"A foundational lower-body movement for quads, glutes and hamstrings.",["Feet shoulder-width, toes slightly out","Sit hips back and down, chest tall","Drive through the whole foot to stand"]],
  ["Forward Lunge","home",["legs"],"Bodyweight",1,"A single-leg movement that builds strength and balance.",["Step forward, lower back knee toward the floor","Front knee tracks over the ankle","Push through the front heel to return"]],
  ["Bulgarian Split Squat","home",["legs"],"Chair or bench",2,"Rear-foot-elevated squat that heavily loads the front leg.",["Rear foot up on a chair behind you","Lower straight down, front shin near vertical","Drive through the front heel to rise"]],
  ["Glute Bridge","home",["legs","core"],"Bodyweight",1,"An isolation move for the glutes and lower back.",["Lie on back, knees bent, feet flat","Squeeze glutes to lift hips up","Avoid overarching the lower back at the top"]],
  ["Wall Sit","home",["legs"],"Wall",1,"An isometric hold that builds quad endurance.",["Back flat against a wall, knees at 90°","Keep weight through the heels","Hold the position, breathing steadily"]],
  ["Step-Up","home",["legs"],"Sturdy step or stair",1,"A functional single-leg movement using any raised platform.",["Place whole foot on the step","Drive through that heel to stand tall","Lower back down with control"]],
  ["Calf Raise","home",["legs"],"Bodyweight",1,"Isolates the calves through ankle extension.",["Stand tall, balls of feet on the floor or edge","Rise as high onto the toes as possible","Lower slowly past neutral for a full stretch"]],
  ["Single-Leg Deadlift","home",["legs","back","core"],"Bodyweight",2,"A balance-and-hinge move that targets hamstrings and glutes unilaterally.",["Stand on one leg, slight knee bend","Hinge forward, extending the free leg back","Keep hips square, return to standing"]],
  ["Curtsy Lunge","home",["legs"],"Bodyweight",2,"A cross-behind lunge that emphasises the glutes and outer hip.",["Step one leg diagonally behind the other","Lower until both knees bend to ~90°","Push through the front heel to return"]],
  ["Jump Squat","home",["legs","cardio"],"Bodyweight",2,"An explosive variation of the squat that builds power.",["Squat down as in a normal squat","Explode upward into a jump","Land softly, straight into the next rep"]],
  ["Barbell Back Squat","gym",["legs","full"],"Barbell, rack",3,"The premier lower-body strength builder, loading the whole leg and trunk.",["Bar sits on the upper traps","Sit hips back and down, chest up","Drive up through the mid-foot"]],
  ["Leg Press","gym",["legs"],"Leg press machine",1,"A machine-guided squat pattern that's easier to control under heavy load.",["Feet shoulder-width on the platform","Lower until knees reach ~90°","Press through the heels, don't lock knees hard"]],
  ["Leg Extension","gym",["legs"],"Leg extension machine",1,"An isolation move for the quadriceps.",["Sit with knees aligned to the machine pivot","Extend legs to full but soft extension","Lower with control, no bouncing"]],
  ["Leg Curl","gym",["legs"],"Leg curl machine",1,"An isolation move for the hamstrings.",["Lie or sit per the machine, pads at the ankles","Curl the pad toward the glutes","Lower slowly, resisting the weight"]],
  ["Romanian Deadlift","gym",["legs","back"],"Barbell or dumbbells",2,"A hip-hinge movement that targets hamstrings and glutes with a straighter leg.",["Soft knee bend, hinge at the hips","Lower the bar close along the legs","Feel a hamstring stretch, then drive hips forward"]],
  ["Walking Lunge","gym",["legs"],"Dumbbells",2,"A loaded, moving lunge for strength and stability.",["Step forward into a lunge, back knee low","Push off the front foot into the next step","Keep torso upright throughout"]],
  ["Barbell Hip Thrust","gym",["legs"],"Barbell, bench",2,"One of the most effective glute-focused exercises.",["Upper back on a bench, bar over hips","Drive hips up to full extension","Squeeze glutes hard at the top"]],
  ["Smith Machine Squat","gym",["legs"],"Smith machine",2,"A fixed-path squat useful for controlled loading.",["Bar on upper traps, feet slightly forward","Lower under control to depth","Press back up through the whole foot"]],
  ["Cable Glute Kickback","gym",["legs"],"Cable machine, ankle strap",1,"An isolation move targeting the glutes.",["Attach ankle strap to a low cable","Kick leg back and up, keeping knee soft","Squeeze the glute at the top, control the return"]],
  ["Seated Calf Raise","gym",["legs"],"Seated calf raise machine",1,"Targets the soleus muscle of the lower calf.",["Sit with pads on the lower thighs","Rise up onto the toes fully","Lower slowly through a full stretch"]],
  ["Plank Shoulder Tap","home",["shoulders","core"],"Bodyweight",1,"A plank variation that challenges shoulder stability and anti-rotation.",["Start in a strong plank, feet wide","Tap opposite shoulder with each hand","Keep hips as still as possible"]],
  ["Y-Raise","home",["shoulders","back"],"Bodyweight or light objects",1,"Targets the lower traps in a Y arm position.",["Hinge slightly forward, arms hanging","Raise arms to form a Y overhead","Lower with control, avoid shrugging"]],
  ["T-Raise","home",["shoulders","back"],"Bodyweight or light objects",1,"Targets the rear delts and mid traps in a T arm position.",["Hinge forward slightly at the hips","Raise arms straight out to the sides","Squeeze shoulder blades together at the top"]],
  ["Wall Handstand Hold","home",["shoulders","core"],"Wall",3,"An advanced isometric hold that builds serious shoulder strength.",["Kick up into a handstand against a wall","Keep body straight, core braced","Hold, breathing steadily, then step down safely"]],
  ["Band Lateral Raise","home",["shoulders"],"Resistance band",1,"Isolates the side deltoid using a band for constant tension.",["Stand on the band, one handle per hand","Raise arms out to shoulder height","Lower with control, don't let the band snap back"]],
  ["Band Front Raise","home",["shoulders"],"Resistance band",1,"Isolates the front deltoid.",["Stand on the band, grip at the front","Raise arms forward to shoulder height","Lower slowly under tension"]],
  ["Doorframe Isometric Press","home",["shoulders"],"Door frame",1,"A static press against a fixed frame to build shoulder tension.",["Stand in a doorway, elbows bent","Press outward into the frame","Hold steady tension, breathe normally"]],
  ["Dumbbell Shoulder Press","gym",["shoulders","arms"],"Dumbbells",2,"A classic overhead press for building shoulder size and strength.",["Start dumbbells at shoulder height","Press straight overhead without arching the back","Lower with control to the start"]],
  ["Barbell Overhead Press","gym",["shoulders","arms"],"Barbell",3,"A heavy compound press for total shoulder development.",["Bar at collarbone height, grip just outside shoulders","Press straight up, head moves slightly back then through","Brace the core to protect the lower back"]],
  ["Cable Lateral Raise","gym",["shoulders"],"Cable machine",1,"A constant-tension isolation move for the side delts.",["Cable at the lowest setting, stand side-on","Raise arm out to shoulder height","Lower with control against the cable"]],
  ["Dumbbell Front Raise","gym",["shoulders"],"Dumbbells",1,"Targets the front deltoid.",["Hold dumbbells in front of the thighs","Raise to shoulder height, slight elbow bend","Lower with control, avoid swinging"]],
  ["Rear Delt Fly","gym",["shoulders","back"],"Dumbbells",1,"Targets the often-neglected rear deltoids.",["Hinge forward, dumbbells hanging below","Raise arms out to the sides, squeezing blades","Lower slowly, resisting the weight"]],
  ["Arnold Press","gym",["shoulders","arms"],"Dumbbells",2,"A rotating press variant that works the shoulder through more of its range.",["Start with palms facing you at shoulder height","Rotate and press overhead, palms forward at the top","Reverse the rotation on the way down"]],
  ["Machine Shoulder Press","gym",["shoulders","arms"],"Shoulder press machine",1,"A guided pressing pattern, good for controlled overload.",["Set seat so handles align with shoulders","Press up without locking elbows hard","Lower with control"]],
  ["Close-Grip Push-Up","home",["arms","chest"],"Bodyweight",2,"A push-up with hands close together to emphasise the triceps.",["Hands just under the shoulders","Elbows track back along the body","Lower chest to hands, press back up"]],
  ["Chair Tricep Dip","home",["arms"],"Sturdy chair",2,"Isolates the triceps using a chair edge.",["Hands on chair edge, legs extended","Lower until elbows reach ~90°","Press back up through the palms"]],
  ["Band Bicep Curl","home",["arms"],"Resistance band",1,"A banded curl providing constant bicep tension.",["Stand on the band, palms facing forward","Curl hands toward the shoulders","Lower slowly, resisting the band"]],
  ["Towel Isometric Curl","home",["arms"],"Towel",1,"A self-resisted isometric curl using a towel.",["Loop a towel under one foot, grip the ends","Pull upward as the foot resists","Hold tension, then switch arms"]],
  ["Plank-to-Push-Up","home",["arms","core","chest"],"Bodyweight",2,"Alternates between forearm and hand plank, working triceps and core.",["Start in a forearm plank","Press up one arm at a time to a hand plank","Reverse back down, alternating the lead arm"]],
  ["Wall Tricep Push","home",["arms"],"Wall",1,"A low-intensity tricep press against a wall, good for beginners.",["Stand facing a wall, hands at chest height","Bend elbows to bring chest near the wall","Press back to start, squeezing triceps"]],
  ["Doorframe Bicep Curl","home",["arms"],"Door frame",1,"Isometric curl using a fixed door frame for resistance.",["Grip the inside of a door frame at hip height","Pull upward into the frame","Hold tension, then release slowly"]],
  ["Bodyweight Curl","home",["arms"],"Table or bar",2,"An inverted curl using a low bar or table edge for bodyweight resistance.",["Lie beneath a low bar, underhand grip","Curl chest up toward the bar","Lower with control to full extension"]],
  ["Barbell Bicep Curl","gym",["arms"],"Barbell",1,"A classic mass-builder for the biceps.",["Grip shoulder-width, elbows pinned to sides","Curl the bar up without swinging","Lower with control to full extension"]],
  ["Dumbbell Curl","gym",["arms"],"Dumbbells",1,"A straightforward bicep isolation move.",["Arms hanging, palms forward","Curl one or both dumbbells up","Lower slowly, avoiding momentum"]],
  ["Hammer Curl","gym",["arms"],"Dumbbells",1,"A neutral-grip curl that also targets the forearms.",["Palms face each other throughout","Curl up keeping elbows still","Lower with control"]],
  ["Preacher Curl","gym",["arms"],"Preacher bench, barbell or dumbbell",2,"An isolation curl that removes momentum via the preacher pad.",["Rest upper arms on the pad","Curl through a full range of motion","Lower slowly without locking out hard"]],
  ["Cable Tricep Pushdown","gym",["arms"],"Cable machine",1,"A staple isolation move for triceps definition.",["Elbows pinned to your sides","Push the bar down to full extension","Let it rise with control under tension"]],
  ["Skull Crusher","gym",["arms"],"EZ bar or dumbbells",2,"A lying triceps extension that builds arm mass.",["Lie on a bench, arms extended over the chest","Lower the weight toward the forehead","Extend back up, keeping upper arms still"]],
  ["Overhead Tricep Extension","gym",["arms"],"Dumbbell or cable",2,"Targets the long head of the triceps overhead.",["Hold weight overhead with both hands","Lower behind the head, elbows pointing up","Extend back to full lockout"]],
  ["Cable Curl","gym",["arms"],"Cable machine",1,"A constant-tension bicep curl using a cable station.",["Stand facing the low pulley","Curl the handle up, elbows fixed","Lower under control against the cable"]],
  ["Plank","home",["core"],"Bodyweight",1,"An isometric hold that builds core and shoulder stability.",["Forearms and toes on the floor","Body forms a straight line, hips level","Brace the abs, breathe steadily"]],
  ["Side Plank","home",["core"],"Bodyweight",2,"Targets the obliques with a side-on isometric hold.",["Stack feet, forearm under the shoulder","Lift hips so the body is a straight line","Keep hips from sagging toward the floor"]],
  ["Crunch","home",["core"],"Bodyweight",1,"A basic spinal flexion move for the upper abs.",["Knees bent, hands lightly behind the head","Curl shoulders up off the floor","Lower with control, don't yank the neck"]],
  ["Bicycle Crunch","home",["core"],"Bodyweight",1,"A rotational crunch that hits obliques and rectus abdominis.",["Hands behind the head, knees bent up","Bring opposite elbow toward opposite knee","Rotate smoothly side to side"]],
  ["Mountain Climber","home",["core","cardio"],"Bodyweight",2,"A dynamic plank variation that raises heart rate while working the core.",["Start in a strong plank position","Drive knees toward the chest alternately","Keep hips low, avoid bouncing"]],
  ["Russian Twist","home",["core"],"Bodyweight or light object",1,"A rotational move that targets the obliques.",["Sit with knees bent, torso leaned back slightly","Rotate the torso side to side","Keep the chest up, move under control"]],
  ["Leg Raise","home",["core"],"Bodyweight",2,"Targets the lower abdominals through hip flexion.",["Lie flat, legs straight, hands by the hips","Raise legs to vertical without swinging","Lower with control, don't let the back arch"]],
  ["Flutter Kick","home",["core"],"Bodyweight",1,"A continuous lower-ab movement.",["Lie flat, legs straight, hands under the hips","Kick legs in a small, steady flutter","Keep the lower back pressed toward the floor"]],
  ["Dead Bug","home",["core"],"Bodyweight",1,"A controlled anti-extension exercise that protects the lower back.",["Lie on back, arms up, knees bent at 90°","Lower opposite arm and leg toward the floor","Keep the lower back flat throughout"]],
  ["Hollow Hold","home",["core"],"Bodyweight",2,"An isometric hold that builds full core tension.",["Lie on back, arms and legs extended slightly off the floor","Press the lower back into the floor","Hold, keeping the shape rigid"]],
  ["Cable Crunch","gym",["core"],"Cable machine",2,"A loaded crunch that lets the abs work against real resistance.",["Kneel below a high cable, rope at the head","Crunch down, rounding the spine","Return with control, keep hips still"]],
  ["Hanging Leg Raise","gym",["core"],"Pull-up bar",3,"A challenging move for the lower abs using a hanging position.",["Hang from the bar, core braced","Raise legs to hip height or higher","Lower with control, avoid swinging"]],
  ["Ab Wheel Rollout","gym",["core"],"Ab wheel",3,"A demanding anti-extension exercise using a rolling wheel.",["Kneel, hands on the wheel","Roll forward as far as control allows","Pull back in using the abs, not the back"]],
  ["Weighted Sit-Up","gym",["core"],"Weight plate",2,"A loaded sit-up for extra resistance.",["Hold a plate to the chest, knees bent","Sit up fully, keeping the plate close","Lower with control"]],
  ["Cable Woodchopper","gym",["core"],"Cable machine",2,"A rotational move that trains the core to generate and resist rotation.",["Set cable high, stand side-on","Pull diagonally across the body to the opposite hip","Rotate through the torso, not just the arms"]],
  ["Machine Crunch","gym",["core"],"Ab crunch machine",1,"A guided crunch pattern for controlled ab loading.",["Sit with pads on the chest and legs","Crunch forward against the resistance","Return with control"]],
  ["Decline Sit-Up","gym",["core"],"Decline bench",2,"An angled sit-up that increases the range of motion.",["Secure feet on the decline bench","Sit up fully, controlled throughout","Lower back down without collapsing"]],
  ["Weighted Russian Twist","gym",["core"],"Weight plate or dumbbell",2,"A loaded rotational core move.",["Sit with knees bent, torso leaned back slightly","Hold a weight, rotate side to side","Keep movement controlled, not flung"]],
  ["Jumping Jacks","home",["cardio"],"Bodyweight",1,"A simple full-body movement that raises the heart rate quickly.",["Start feet together, arms at sides","Jump feet out while raising arms overhead","Return to start in one fluid motion"]],
  ["High Knees","home",["cardio","legs"],"Bodyweight",1,"A running-in-place drill that emphasises hip flexor speed.",["Drive knees up toward hip height","Stay light on the balls of the feet","Pump arms in rhythm with the legs"]],
  ["Burpee","home",["cardio","full"],"Bodyweight",3,"A demanding full-body movement combining a squat, plank and jump.",["Drop into a squat, hands on the floor","Kick feet back to a plank, then back in","Explode upward into a jump"]],
  ["Butt Kicks","home",["cardio","legs"],"Bodyweight",1,"A light cardio drill that also warms up the quads.",["Jog in place, heels kicking toward the glutes","Keep the torso upright","Keep a quick, light cadence"]],
  ["Skater Hop","home",["cardio","legs"],"Bodyweight",2,"A lateral bounding movement for agility and cardio.",["Hop sideways onto one leg","Sweep the trailing leg behind","Bound back the other direction"]],
  ["Jump Rope","home",["cardio","legs"],"Skipping rope",2,"A classic, highly effective cardio and coordination drill.",["Keep elbows close, wrists doing the turning","Small, light hops off the balls of the feet","Maintain a steady, even rhythm"]],
  ["Shadow Boxing","home",["cardio","arms"],"Bodyweight",1,"Throwing punches in the air for cardio and coordination.",["Stay light on the feet, guard up","Rotate the hips and shoulders into punches","Keep a steady pace, breathe with the combos"]],
  ["Star Jump","home",["cardio","legs"],"Bodyweight",1,"An explosive jump forming a star shape at the peak.",["Start in a partial squat, arms in","Jump up, spreading arms and legs wide","Land softly back into the squat"]],
  ["Treadmill Sprint Intervals","gym",["cardio","legs"],"Treadmill",2,"Alternating fast and easy paces to build cardiovascular capacity.",["Warm up at an easy pace first","Sprint hard for the set interval","Recover at a walk before the next round"]],
  ["Rowing Machine","gym",["cardio","back","legs"],"Rowing machine",2,"A full-body cardio movement that's easy on the joints.",["Drive with the legs first, then lean back","Pull the handle to the lower ribs","Reverse the sequence smoothly on the return"]],
  ["Assault Bike","gym",["cardio","arms","legs"],"Air bike",2,"A brutal full-body cardio tool using arms and legs together.",["Push and pull the handles with the legs driving","Keep a strong, upright posture","Pace effort to match the interval length"]],
  ["Stair Climber","gym",["cardio","legs"],"Stair climber machine",1,"A steady-state cardio option that targets the legs and glutes.",["Stand tall, avoid leaning on the rails","Take full steps rather than tiny ones","Keep a steady, sustainable pace"]],
  ["Battle Ropes","gym",["cardio","arms","core"],"Battle ropes",2,"An upper-body-driven cardio and conditioning tool.",["Stand in an athletic stance, knees soft","Whip the ropes in alternating waves","Keep the core braced throughout"]],
  ["Elliptical Intervals","gym",["cardio","legs"],"Elliptical machine",1,"A low-impact cardio option suitable for varied intensities.",["Keep posture tall, light grip on handles","Push through the whole foot","Vary resistance/speed for intervals"]],
  ["Stationary Bike Sprints","gym",["cardio","legs"],"Stationary bike",2,"Short, high-effort bursts on a stationary bike.",["Set a moderate warm-up resistance first","Sprint at max effort for the interval","Spin easy to recover between rounds"]],
  ["Ski Erg","gym",["cardio","back","arms"],"Ski erg machine",2,"A full-body pulling cardio machine mimicking cross-country skiing.",["Hinge from the hips as you pull down","Drive through the lats and core","Reset tall at the top of each stroke"]],
  ["Bear Crawl","home",["full","core"],"Bodyweight",2,"A crawling pattern that builds full-body coordination and core strength.",["Hands and toes on the floor, knees hovering","Move opposite hand and foot together","Keep the hips low and steady"]],
  ["Inchworm","home",["full","core"],"Bodyweight",1,"A stretch-and-strength combo moving from standing to a plank and back.",["Hinge over and walk hands out to a plank","Hold briefly, keeping the core tight","Walk hands back and stand up tall"]],
  ["Squat to Overhead Reach","home",["full","legs"],"Bodyweight",1,"Combines a squat with an overhead reach for a full-body warm-up move.",["Squat down, hands toward the floor","Stand explosively, reaching arms overhead","Repeat in one smooth motion"]],
  ["Plank Jack","home",["full","core","cardio"],"Bodyweight",2,"A plank with jumping-jack style leg movement for core and cardio.",["Hold a strong plank position","Jump feet apart and back together","Keep hips level throughout"]],
  ["Crab Walk","home",["full","core","arms"],"Bodyweight",2,"A reverse crawling pattern that challenges shoulders, triceps and glutes.",["Sit with hands behind you, feet flat, hips lifted","Walk hands and feet together","Keep hips raised throughout the movement"]],
  ["Broad Jump","home",["full","legs","cardio"],"Bodyweight",2,"An explosive horizontal jump for power development.",["Swing arms back, bend the knees","Jump forward as far as possible","Land softly with bent knees"]],
  ["Bodyweight Man Maker","home",["full","cardio"],"Bodyweight",3,"A demanding combo of push-up, row motion and jump squat.",["Start in a plank, do a push-up","Step feet in and stand up","Finish with a small jump"]],
  ["World's Greatest Stretch","home",["full","legs","back"],"Bodyweight",1,"A dynamic mobility sequence that opens the hips, spine and shoulders.",["Step into a deep lunge","Rotate the torso and reach the same-side arm up","Return and repeat on the other side"]],
  ["Kettlebell Swing","gym",["full","legs","back"],"Kettlebell",2,"A hip-hinge power move that trains the whole posterior chain.",["Hinge at the hips, kettlebell between the legs","Snap the hips forward to swing it up","Let it float to chest height, then hinge again"]],
  ["Clean and Press","gym",["full","legs","shoulders"],"Barbell or dumbbells",3,"A technical full-body lift combining a pull, catch and overhead press.",["Pull the weight from the floor explosively","Catch it at the shoulders in a quarter squat","Press overhead to finish"]],
  ["Thruster","gym",["full","legs","shoulders"],"Barbell or dumbbells",3,"A squat-to-press combo that's a full-body conditioning staple.",["Hold weight at the shoulders, squat down","Drive up explosively","Use the momentum to press overhead"]],
  ["Farmer's Carry","gym",["full","core","arms"],"Dumbbells or kettlebells",1,"A loaded carry that builds grip, core and total-body stability.",["Pick up heavy weights at your sides","Walk tall with shoulders back","Keep steps controlled, core braced"]],
  ["Medicine Ball Slam","gym",["full","core","cardio"],"Medicine ball",2,"An explosive, high-power full-body movement.",["Raise the ball overhead","Slam it down forcefully in front of you","Squat to catch the bounce and repeat"]],
  ["Sandbag Carry","gym",["full","core","legs"],"Sandbag",2,"An unstable-load carry that builds functional strength.",["Hug or shoulder the sandbag securely","Walk with a tall, braced posture","Set down with control, not a drop"]],
  ["Battle Rope Slam","gym",["full","cardio","arms"],"Battle ropes",2,"A combined slam-and-cardio move for power and conditioning.",["Athletic stance, ropes gripped firmly","Slam both ropes down forcefully together","Reset quickly and repeat the rhythm"]],
  ["Sled Push","gym",["full","legs","cardio"],"Weighted sled",2,"A ground-based power and conditioning move with low joint impact.",["Lean into the sled, arms extended","Drive hard through the legs, short steps","Keep the back flat, chest low"]]
];

/* ---------- posture pose picker: maps each exercise to one of the pose keys below ---------- */
function pickPose(name, tags) {
  const n = name.toLowerCase();
  if (/plank|mountain climber|bear crawl|crab walk|inchworm|man maker|shoulder tap|plank jack/.test(n)) return "plank";
  if (/dip|push-?up|bench press|chest press/.test(n)) return "pushup";
  if (/fly|pec deck/.test(n)) return "lateral-raise";
  if (/squat|thruster|clean and press/.test(n)) return "squat";
  if (/lunge|split squat|step-up|curtsy|skater/.test(n)) return "lunge";
  if (/pull-?up|chin-?up|pulldown/.test(n)) return "pullup";
  if (/deadlift|good morning|hinge|kettlebell swing/.test(n)) return "hinge";
  if (/hip thrust|glute kickback|bridge|thrust/.test(n)) return "bridge";
  if (/row|ski erg/.test(n)) return "row";
  if (/curl|skull crusher|overhead extension|pushdown|tricep/.test(n)) return "curl";
  if (/overhead press|shoulder press|arnold press|military/.test(n)) return "press";
  if (/lateral raise|front raise|y-raise|t-raise|rear delt|upright row/.test(n)) return "lateral-raise";
  if (/leg raise|flutter|dead bug|hollow/.test(n)) return "legraise";
  if (/twist|woodchopper/.test(n)) return "twist";
  if (/crunch|sit-?up/.test(n)) return "situp";
  if (/jumping jack|star jump/.test(n)) return "jack";
  if (/calf raise/.test(n)) return "calf";
  if (/carry|farmer|sandbag|sled/.test(n)) return "carry";
  return "standing";
}

const BASES = RAW_EXERCISES.map(([n, c, m, eq, diff, desc, cues], i) => ({
  id: `ex-${i}`, name: n, context: c, tags: m, equipment: eq, difficulty: diff, desc, cues,
  poseKey: pickPose(n, m)
}));

const TAGS = ["chest","back","legs","shoulders","arms","core","cardio","full"];
const TAG_LABEL = { chest:"Chest", back:"Back", legs:"Legs", shoulders:"Shoulders", arms:"Arms", core:"Core", cardio:"Cardio", full:"Full Body" };

/* ============================== VARIANT GENERATOR (base 132 -> library of 500) ============================== */
const VARIANTS = [
  { key:"tempo", suffix:"Slow Tempo", diff:0, excludeTags:["cardio"],
    desc:(b)=>`A slow-tempo version of the ${b.name.toLowerCase()}, using a controlled 3-second lowering phase to build extra strength and control.`,
    cue:"Lower for a full 3 seconds under control" },
  { key:"pause", suffix:"Pause Rep", diff:0, excludeTags:["cardio"],
    desc:(b)=>`A pause-rep version of the ${b.name.toLowerCase()} — hold briefly at the hardest point of each rep before continuing.`,
    cue:"Pause for one full second at the hardest point of the rep" },
  { key:"explosive", suffix:"Explosive", diff:1, excludeTags:["cardio"], excludeNameRegex:/hold|wall sit/i,
    desc:(b)=>`An explosive version of the ${b.name.toLowerCase()}, driving the lifting phase as fast as good form allows.`,
    cue:"Drive up with maximum controlled speed, stay smooth on the way down" },
  { key:"iso", suffix:"Iso Hold", diff:0, excludeTags:["cardio"], excludeNameRegex:/hold|wall sit|plank/i,
    desc:(b)=>`An isometric-hold version of the ${b.name.toLowerCase()} — hold the toughest position of the rep for time instead of moving through reps.`,
    cue:"Hold the peak-tension position and keep breathing steadily" },
  { key:"singleArm", suffix:"Single-Arm", diff:1, requireTagsAny:["arms","back","chest","shoulders"], requireEqRegex:/dumbbell|cable|band|bodyweight/i,
    desc:(b)=>`A single-arm version of the ${b.name.toLowerCase()}, working one side at a time to iron out imbalances.`,
    cue:"Brace the core to resist rotating toward the working side" },
  { key:"singleLeg", suffix:"Single-Leg", diff:1, requireTagsAny:["legs"], requireEqRegex:/dumbbell|bodyweight|band|cable/i,
    desc:(b)=>`A single-leg version of the ${b.name.toLowerCase()}, adding a real balance and stability challenge.`,
    cue:"Keep the hips level, don't let the working knee cave inward" },
  { key:"band", suffix:"Band-Resisted", diff:0, context:"home", requireEqRegex:/bodyweight/i,
    eqOverride:(b)=>`${b.equipment} + resistance band`,
    desc:(b)=>`A band-resisted version of the ${b.name.toLowerCase()}, adding extra tension through the range of motion.`,
    cue:"Keep tension on the band throughout — don't let it go slack" }
];

function variantEligible(base, v) {
  if (v.excludeTags && v.excludeTags.some((t) => base.tags.includes(t))) return false;
  if (v.requireTagsAny && !v.requireTagsAny.some((t) => base.tags.includes(t))) return false;
  if (v.requireEqRegex && !v.requireEqRegex.test(base.equipment)) return false;
  if (v.excludeNameRegex && v.excludeNameRegex.test(base.name)) return false;
  if (v.context && base.context !== v.context) return false;
  return true;
}
function makeSingleVariant(base, v, uid) {
  return {
    id: `${base.id}-${v.key}-${uid}`, name: `${base.name} (${v.suffix})`, context: base.context, tags: base.tags,
    equipment: v.eqOverride ? v.eqOverride(base) : base.equipment,
    difficulty: Math.min(3, Math.max(1, base.difficulty + v.diff)),
    desc: v.desc(base), cues: [...base.cues.slice(0, 2), v.cue], poseKey: base.poseKey
  };
}
function makeComboVariant(base, v1, v2, uid) {
  return {
    id: `${base.id}-${v1.key}-${v2.key}-${uid}`, name: `${base.name} (${v1.suffix} + ${v2.suffix})`, context: base.context, tags: base.tags,
    equipment: v1.eqOverride ? v1.eqOverride(base) : (v2.eqOverride ? v2.eqOverride(base) : base.equipment),
    difficulty: Math.min(3, Math.max(1, base.difficulty + v1.diff + v2.diff)),
    desc: `${v1.desc(base)} Combined here with a ${v2.suffix.toLowerCase()} emphasis: ${v2.cue.toLowerCase()}.`,
    cues: [base.cues[0], v1.cue, v2.cue], poseKey: base.poseKey
  };
}
function roundRobin(arrays) {
  const out = []; let i = 0; let more = true;
  while (more) { more = false; for (const arr of arrays) { if (arr[i]) { out.push(arr[i]); more = true; } } i++; }
  return out;
}
function buildLibrary(target = 500) {
  const pool = [...BASES];
  const perVariant = VARIANTS.map((v) => BASES.filter((b) => variantEligible(b, v)).map((b, idx) => makeSingleVariant(b, v, idx)));
  pool.push(...roundRobin(perVariant));
  if (pool.length < target) {
    const comboArrays = [];
    for (let i = 0; i < VARIANTS.length; i++) {
      for (let j = i + 1; j < VARIANTS.length; j++) {
        const v1 = VARIANTS[i], v2 = VARIANTS[j];
        const combos = BASES.filter((b) => variantEligible(b, v1) && variantEligible(b, v2)).map((b, idx) => makeComboVariant(b, v1, v2, idx));
        if (combos.length) comboArrays.push(combos);
      }
    }
    pool.push(...roundRobin(comboArrays));
  }
  return pool.slice(0, target);
}
const EXERCISES = buildLibrary(500);

/* ============================== 3D MANNEQUIN VIEWER (closed-source-safe) ==============================
   Own lightweight forward-kinematics rig rendered with plain Three.js (MIT-licensed — no
   copyleft, no attribution obligations, safe for a closed-source app). No external character
   assets, no third-party pose-animation package: everything here is our own ~150 lines of FK
   math plus primitive Three.js meshes. Each exercise plays a looping A<->B pose animation
   (start position <-> end position) built from the same joint-angle values used earlier.

   Rig: a simple parent/child joint tree (pelvis root; spine/chest/neck/head; two arms;
   two legs). Every joint's rest offset is expressed in its PARENT's rest-oriented local
   frame; per-pose rotations (x = flex/extend, y = twist/rotate, z = abduct/adduct, all in
   degrees) are converted to quaternions and composed parent->child, standard skeletal FK.
   Rendering: one thin cylinder mesh per bone segment (fixed unit geometry, repositioned/
   rescaled every frame — no per-frame geometry allocation), a sphere for the head.

   These joint angles are a hand-authored, stylized approximation, not motion-captured data —
   expect to nudge a few signs/magnitudes once you see it move; I can't render/preview this
   myself to verify it before you run it.
============================================================================================= */
const BONES = {
  pelvis:    { parent: null,       offset: [0, 0, 0] },
  spine:     { parent: "pelvis",   offset: [0, 0.15, 0] },
  chest:     { parent: "spine",    offset: [0, 0.17, 0] },
  neck:      { parent: "chest",    offset: [0, 0.09, 0] },
  head:      { parent: "neck",     offset: [0, 0.11, 0] },
  shoulder_l:{ parent: "chest",    offset: [-0.18, 0.05, 0] },
  elbow_l:   { parent: "shoulder_l", offset: [0, -0.27, 0] },
  wrist_l:   { parent: "elbow_l",  offset: [0, -0.25, 0] },
  shoulder_r:{ parent: "chest",    offset: [0.18, 0.05, 0] },
  elbow_r:   { parent: "shoulder_r", offset: [0, -0.27, 0] },
  wrist_r:   { parent: "elbow_r",  offset: [0, -0.25, 0] },
  hip_l:     { parent: "pelvis",   offset: [-0.105, -0.03, 0] },
  knee_l:    { parent: "hip_l",    offset: [0, -0.44, 0] },
  ankle_l:   { parent: "knee_l",   offset: [0, -0.42, 0] },
  foot_l:    { parent: "ankle_l",  offset: [0, -0.02, -0.13] },
  hip_r:     { parent: "pelvis",   offset: [0.105, -0.03, 0] },
  knee_r:    { parent: "hip_r",    offset: [0, -0.44, 0] },
  ankle_r:   { parent: "knee_r",   offset: [0, -0.42, 0] },
  foot_r:    { parent: "ankle_r",  offset: [0, -0.02, -0.13] },
};
// Visual radius per segment — tapered so thighs/torso read thicker than forearms/calves.
const SEGMENT_RADIUS = {
  spine: 0.095, chest: 0.105, neck: 0.045, head: 0.105,
  shoulder_l: 0.055, elbow_l: 0.050, wrist_l: 0.040,
  shoulder_r: 0.055, elbow_r: 0.050, wrist_r: 0.040,
  hip_l: 0.065, knee_l: 0.078, ankle_l: 0.058, foot_l: 0.050,
  hip_r: 0.065, knee_r: 0.078, ankle_r: 0.058, foot_r: 0.050,
};
const SEGMENTS = Object.keys(BONES).filter((id) => BONES[id].parent);
// Joints get a small sphere at their end position, sized to whichever adjoining
// segment is thicker, so two capsules meeting at an angle don't show a visible seam.
const JOINT_SPHERES = ["neck", "shoulder_l", "elbow_l", "wrist_l", "shoulder_r", "elbow_r", "wrist_r", "hip_l", "knee_l", "ankle_l", "hip_r", "knee_r", "ankle_r"];
function boneLength(id) {
  const [x, y, z] = BONES[id].offset;
  return Math.hypot(x, y, z);
}

function pose(rootRotX = 0, rootTy = 0, joints = {}) {
  return { root: { rotX: rootRotX, ty: rootTy }, joints };
}
function j(x = 0, y = 0, z = 0) { return { x, y, z }; }
function ang(poseObj, id, axis) { return (poseObj.joints[id] && poseObj.joints[id][axis]) || 0; }
function lerp(a, b, t) { return a + (b - a) * t; }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

/* Each move: two end poses (a/b), a hold time at each end and a tween time between them.
   Root rotX tilts/lays the whole rig (used for lying/hinge context); root ty lifts/drops
   the pelvis. Joint angles reuse the values worked out earlier for the equivalent movement. */
const MOVE_DATA = {
  standing: { hold: 1.4, move: 1.2, contacts: ["foot_l", "foot_r"], a: pose(0, 0, { shoulder_l: j(0, 0, 4), shoulder_r: j(0, 0, -4) }), b: pose(0, 0, { shoulder_l: j(0, 0, -4), shoulder_r: j(0, 0, 4) }) },
  carry:    { hold: 0.5, move: 0.6, contacts: ["foot_l", "foot_r"], a: pose(0, 0, { hip_l: j(12), knee_l: j(-12), hip_r: j(-12), knee_r: j(12), shoulder_l: j(-6), shoulder_r: j(-6) }), b: pose(0, 0, { hip_l: j(-12), knee_l: j(12), hip_r: j(12), knee_r: j(-12), shoulder_l: j(-6), shoulder_r: j(-6) }) },
  plank:    { hold: 3, move: 0.01, contacts: ["wrist_l", "wrist_r", "foot_l", "foot_r"], a: pose(-76.6, -0.501, { shoulder_l: j(90), shoulder_r: j(90), elbow_l: j(-6), elbow_r: j(-6) }), b: null },
  squat:    { hold: 0.5, move: 1.3, contacts: ["foot_l", "foot_r"], a: pose(0, 0, {}), b: pose(-8, -0.16, { hip_l: j(80), hip_r: j(80), knee_l: j(-95), knee_r: j(-95), ankle_l: j(14), ankle_r: j(14) }) },
  pushup:   { hold: 0.5, move: 1.1, contacts: ["wrist_l", "wrist_r", "foot_l", "foot_r"], a: pose(-76.7, -0.503, { shoulder_l: j(90, 0, -6), shoulder_r: j(90, 0, 6), elbow_l: j(-8), elbow_r: j(-8) }), b: pose(-97.4, -0.793, { shoulder_l: j(78, 0, -22), shoulder_r: j(78, 0, 22), elbow_l: j(-78), elbow_r: j(-78) }) },
  lunge:    { hold: 0.5, move: 1.2, contacts: ["foot_l", "foot_r"], a: pose(0, 0, {}), b: pose(0, -0.12, { hip_l: j(35), knee_l: j(-90), hip_r: j(-25), knee_r: j(-90) }) },
  hinge:    { hold: 0.5, move: 1.3, contacts: ["foot_l", "foot_r"], a: pose(0, 0, {}), b: pose(0, 0, { spine: j(-65), knee_l: j(-20), knee_r: j(-20) }) },
  bridge:   { hold: 0.5, move: 1.1, contacts: ["foot_l", "foot_r"], a: pose(-90, -0.85, { hip_l: j(70), hip_r: j(70), knee_l: j(-90), knee_r: j(-90) }), b: pose(-90, -0.70, { hip_l: j(70), hip_r: j(70), knee_l: j(-90), knee_r: j(-90) }) },
  row:      { hold: 0.5, move: 1.0, a: pose(0, -0.3, { hip_l: j(80), hip_r: j(80), knee_l: j(-90), knee_r: j(-90), shoulder_l: j(20), shoulder_r: j(20), elbow_l: j(-10), elbow_r: j(-10) }), b: pose(0, -0.3, { hip_l: j(80), hip_r: j(80), knee_l: j(-90), knee_r: j(-90), shoulder_l: j(-30), shoulder_r: j(-30), elbow_l: j(-100), elbow_r: j(-100) }) },
  curl:     { hold: 0.5, move: 0.9, contacts: ["foot_l", "foot_r"], a: pose(0, 0, { elbow_l: j(-10), elbow_r: j(-10) }), b: pose(0, 0, { elbow_l: j(-140), elbow_r: j(-140) }) },
  press:    { hold: 0.5, move: 1.0, contacts: ["foot_l", "foot_r"], a: pose(0, 0, { shoulder_l: j(40), shoulder_r: j(40), elbow_l: j(-90), elbow_r: j(-90) }), b: pose(0, 0, { shoulder_l: j(170), shoulder_r: j(170), elbow_l: j(-10), elbow_r: j(-10) }) },
  "lateral-raise": { hold: 0.5, move: 1.1, a: pose(0, 0, {}), b: pose(0, 0, { shoulder_l: j(0, 0, 90), shoulder_r: j(0, 0, -90) }) },
  pullup:   { hold: 0.5, move: 1.1, a: pose(0, -0.15, { shoulder_l: j(170), shoulder_r: j(170), elbow_l: j(-10), elbow_r: j(-10) }), b: pose(0, 0.15, { shoulder_l: j(170), shoulder_r: j(170), elbow_l: j(-140), elbow_r: j(-140) }) },
  situp:    { hold: 0.5, move: 1.1, contacts: ["foot_l", "foot_r"], a: pose(-90, -0.85, { hip_l: j(70), hip_r: j(70), knee_l: j(-90), knee_r: j(-90) }), b: pose(-90, -0.85, { hip_l: j(70), hip_r: j(70), knee_l: j(-90), knee_r: j(-90), spine: j(-65) }) },
  legraise: { hold: 0.5, move: 1.2, contacts: ["chest"], a: pose(-90, -0.85, {}), b: pose(-90, -0.85, { hip_l: j(80), hip_r: j(80) }) },
  jack:     { hold: 0.4, move: 0.45, contacts: ["foot_l", "foot_r"], a: pose(0, 0, {}), b: pose(0, 0.05, { shoulder_l: j(0, 0, 80), shoulder_r: j(0, 0, -80), hip_l: j(0, 0, 20), hip_r: j(0, 0, -20) }) },
  calf:     { hold: 0.5, move: 0.9, a: pose(0, 0, {}), b: pose(0, 0.04, { ankle_l: j(-40), ankle_r: j(-40) }) },
  twist:    { hold: 0.5, move: 0.9, a: pose(0, -0.3, { hip_l: j(80), hip_r: j(80), knee_l: j(-90), knee_r: j(-90) }), b: pose(0, -0.3, { hip_l: j(80), hip_r: j(80), knee_l: j(-90), knee_r: j(-90), spine: j(0, 40, 0) }) },
};
MOVE_DATA.plank.b = MOVE_DATA.plank.a;

function interpolatePose(a, b, t) {
  const root = { rotX: lerp(a.root.rotX, b.root.rotX, t), ty: lerp(a.root.ty, b.root.ty, t) };
  const joints = {};
  const ids = new Set([...Object.keys(a.joints), ...Object.keys(b.joints)]);
  ids.forEach((id) => {
    joints[id] = { x: lerp(ang(a, id, "x"), ang(b, id, "x"), t), y: lerp(ang(a, id, "y"), ang(b, id, "y"), t), z: lerp(ang(a, id, "z"), ang(b, id, "z"), t) };
  });
  return { root, joints };
}

function computeFK(interpolated, THREE) {
  const world = {};
  const rootQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler((interpolated.root.rotX * Math.PI) / 180, 0, 0, "XYZ"));
  world.pelvis = { pos: new THREE.Vector3(0, 1.0 + interpolated.root.ty, 0), quat: rootQuat };
  const order = Object.keys(BONES).filter((id) => id !== "pelvis");
  // BONES is defined in dependency order already (parents before children)
  order.forEach((id) => {
    const b = BONES[id];
    const parent = world[b.parent];
    const a = interpolated.joints[id] || { x: 0, y: 0, z: 0 };
    const localQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler((a.x * Math.PI) / 180, (a.y * Math.PI) / 180, (a.z * Math.PI) / 180, "XYZ"));
    const worldQuat = parent.quat.clone().multiply(localQuat);
    const offset = new THREE.Vector3(...b.offset).applyQuaternion(parent.quat);
    const worldPos = parent.pos.clone().add(offset);
    world[id] = { pos: worldPos, quat: worldQuat };
  });
  return world;
}

function Mannequin3D({ poseKey, accent, size = 220 }) {
  const frontRef = useRef(null);
  const sideRef = useRef(null);
  const stateRef = useRef(null);
  const [errMsg, setErrMsg] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setErrMsg(null);
    try {
      if (!frontRef.current || !sideRef.current) return;

      const scene = new THREE.Scene();

      // Two cameras sharing one scene: front (0°) and side (90°). Rather than a fixed
      // position tuned only for a standing figure (which breaks completely for lying
      // poses like push-up — the body ends up entirely out of frame), both cameras
      // auto-fit to the figure's actual world-space bounding box every frame.
      const makeCamera = () => new THREE.PerspectiveCamera(32, 1, 0.1, 20);
      const frontCam = makeCamera();
      const sideCam = makeCamera();
      const frameBox = new THREE.Box3();
      const frameCenter = new THREE.Vector3();
      const frameSize = new THREE.Vector3();
      function autoFrame(world) {
        frameBox.makeEmpty();
        Object.values(world).forEach((w) => frameBox.expandByPoint(w.pos));
        const c = frameBox.getCenter(new THREE.Vector3());
        frameBox.expandByPoint(new THREE.Vector3(c.x, 0, c.z)); // always keep the floor (y=0) in shot
        frameBox.expandByScalar(0.16); // padding so limbs/head aren't clipped at the edge
        frameBox.getCenter(frameCenter);
        frameBox.getSize(frameSize);
        const radius = Math.max(frameSize.x, frameSize.y, frameSize.z) * 0.5;
        const dist = radius / Math.sin((frontCam.fov * Math.PI) / 360);
        frontCam.position.set(frameCenter.x, frameCenter.y, frameCenter.z + dist);
        frontCam.lookAt(frameCenter);
        sideCam.position.set(frameCenter.x + dist, frameCenter.y, frameCenter.z);
        sideCam.lookAt(frameCenter);
      }

      const frontRenderer = new THREE.WebGLRenderer({ canvas: frontRef.current, antialias: true, alpha: true });
      const sideRenderer = new THREE.WebGLRenderer({ canvas: sideRef.current, antialias: true, alpha: true });
      [frontRenderer, sideRenderer].forEach((r) => r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)));

      scene.add(new THREE.AmbientLight(0xffffff, 0.62));
      const keyLight = new THREE.DirectionalLight(0xffffff, 0.85);
      keyLight.position.set(1.6, 2.6, 2.2);
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
      fillLight.position.set(-1.8, 1.6, -1.6);
      scene.add(fillLight);
      const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
      rimLight.position.set(0, 1.5, -2.5);
      scene.add(rimLight);

      // Floor: a soft translucent plane plus a crisp grid, so hand/foot placement
      // can actually be judged against a visible ground reference.
      const floorMat = new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.10 });
      const floor = new THREE.Mesh(new THREE.CircleGeometry(2.2, 48), floorMat);
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);
      const grid = new THREE.GridHelper(2.6, 13, 0x888888, 0x888888);
      grid.material.transparent = true;
      grid.material.opacity = 0.35;
      scene.add(grid);

      const accentColor = new THREE.Color(accent);
      const bodyColor = new THREE.Color("#9a9285");
      const sphereGeo = new THREE.SphereGeometry(1, 20, 16);
      const headGeo = new THREE.SphereGeometry(1, 24, 20);
      const meshes = {};
      const joints = {};
      const geoms = [sphereGeo, headGeo]; // tracked for disposal

      SEGMENTS.forEach((id) => {
        if (id === "head") {
          const mesh = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.5, metalness: 0.04 }));
          scene.add(mesh);
          meshes[id] = mesh;
          return;
        }
        const isTorso = id === "spine" || id === "chest" || id === "neck";
        const color = isTorso ? bodyColor : accentColor;
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.04 });
        const radius = SEGMENT_RADIUS[id] || 0.045;
        const fullLen = boneLength(id);
        const straight = Math.max(fullLen - radius * 2, 0.01); // capsule cylindrical length between the two rounded caps
        const geo = new THREE.CapsuleGeometry(radius, straight, 4, 10);
        geoms.push(geo);
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);
        meshes[id] = mesh;
      });
      JOINT_SPHERES.forEach((id) => {
        const isTorsoJoint = id === "neck";
        const color = isTorsoJoint ? bodyColor : accentColor;
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.04 });
        const mesh = new THREE.Mesh(sphereGeo, mat);
        scene.add(mesh);
        joints[id] = mesh;
      });

      const up = new THREE.Vector3(0, 1, 0);
      let t0 = performance.now();
      let phase = "holdA"; // holdA | toB | holdB | toA
      let phaseElapsed = 0;

      function sizeRenderer(renderer, cam, canvas) {
        const w = canvas.clientWidth || size / 2, h = canvas.clientHeight || size / 2;
        if (renderer.domElement.width !== w || renderer.domElement.height !== h) {
          renderer.setSize(w, h, false);
          cam.aspect = w / h;
          cam.updateProjectionMatrix();
        }
      }

      function tick(now) {
        if (cancelled) return;
        const dt = Math.min((now - t0) / 1000, 0.05);
        t0 = now;
        const move = MOVE_DATA[poseKey] || MOVE_DATA.standing;
        const hasB = !!move.b;
        phaseElapsed += dt;

        let interpolated;
        if (!hasB) {
          interpolated = move.a;
        } else if (phase === "holdA") {
          interpolated = move.a;
          if (phaseElapsed >= move.hold) { phase = "toB"; phaseElapsed = 0; }
        } else if (phase === "toB") {
          const t = Math.min(phaseElapsed / move.move, 1);
          interpolated = interpolatePose(move.a, move.b, easeInOut(t));
          if (t >= 1) { phase = "holdB"; phaseElapsed = 0; }
        } else if (phase === "holdB") {
          interpolated = move.b;
          if (phaseElapsed >= move.hold) { phase = "toA"; phaseElapsed = 0; }
        } else {
          const t = Math.min(phaseElapsed / move.move, 1);
          interpolated = interpolatePose(move.b, move.a, easeInOut(t));
          if (t >= 1) { phase = "holdA"; phaseElapsed = 0; }
        }

        const world = computeFK(interpolated, THREE);
        // Ground the pose: since this is forward-kinematics only (no true inverse
        // kinematics), we can't pin both hands and feet to exact fixed points while
        // joints move — but we CAN guarantee whichever contact point is lowest sits
        // exactly on the floor every frame, which reads as "planted" for the parts
        // that matter (e.g. hands+feet for push-up) instead of floating or clipping.
        if (move.contacts && move.contacts.length) {
          const minY = Math.min(...move.contacts.map((id) => world[id].pos.y));
          Object.values(world).forEach((w) => { w.pos.y -= minY; });
        }
        autoFrame(world);
        SEGMENTS.forEach((id) => {
          const b = BONES[id];
          const mesh = meshes[id];
          if (id === "head") {
            mesh.position.copy(world[id].pos);
            mesh.scale.set(SEGMENT_RADIUS.head * 0.88, SEGMENT_RADIUS.head * 1.08, SEGMENT_RADIUS.head * 0.92);
            mesh.quaternion.copy(world[id].quat);
            return;
          }
          const p1 = world[b.parent].pos, p2 = world[id].pos;
          const mid = p1.clone().add(p2).multiplyScalar(0.5);
          const dir = p2.clone().sub(p1).normalize();
          mesh.position.copy(mid);
          mesh.quaternion.setFromUnitVectors(up, dir);
        });
        JOINT_SPHERES.forEach((id) => {
          const mesh = joints[id];
          mesh.position.copy(world[id].pos);
          const r = (SEGMENT_RADIUS[id] || 0.045) * 1.02;
          mesh.scale.setScalar(r);
        });

        sizeRenderer(frontRenderer, frontCam, frontRef.current);
        sizeRenderer(sideRenderer, sideCam, sideRef.current);
        frontRenderer.render(scene, frontCam);
        sideRenderer.render(scene, sideCam);
        stateRef.current.raf = requestAnimationFrame(tick);
      }

      stateRef.current = { frontRenderer, sideRenderer, scene, geoms, raf: requestAnimationFrame(tick) };
    } catch (e) {
      if (!cancelled) setErrMsg((e && e.message) || "3D preview failed to start");
    }

    return () => {
      cancelled = true;
      if (stateRef.current) {
        cancelAnimationFrame(stateRef.current.raf);
        stateRef.current.frontRenderer.dispose();
        stateRef.current.sideRenderer.dispose();
        stateRef.current.scene.traverse((obj) => {
          if (obj.material) obj.material.dispose();
          if (obj.geometry) obj.geometry.dispose();
        });
        stateRef.current = null;
      }
    };
  }, [poseKey, accent, size]);

  const viewSize = Math.floor((size - 10) / 2);
  return (
    <div className="mannequin-dual" style={{ width: size }}>
      <div className="mannequin-wrap" style={{ width: viewSize, height: viewSize }}>
        <canvas ref={frontRef} className="mannequin-canvas" />
        <span className="mannequin-view-label">Front</span>
      </div>
      <div className="mannequin-wrap" style={{ width: viewSize, height: viewSize }}>
        <canvas ref={sideRef} className="mannequin-canvas" />
        <span className="mannequin-view-label">Side</span>
      </div>
      {errMsg && (
        <div className="mannequin-error">
          <Info size={16} />
          <span>3D preview couldn't start: {errMsg}</span>
        </div>
      )}
    </div>
  );
}

function BodyDiagram({ activeTags = [], accent = "#E0562A" }) {
  const on = (t) => activeTags.includes(t);
  const fill = (t) => (on(t) ? accent : "var(--diagram-off)");
  return (
    <svg viewBox="0 0 100 160" className="body-diagram" aria-hidden="true">
      <circle cx="50" cy="14" r="11" fill="var(--diagram-off)" />
      <rect x="38" y="27" width="24" height="34" rx="6" fill={fill("chest")} />
      <rect x="30" y="27" width="9" height="30" rx="4" fill={fill("shoulders")} transform="rotate(-8 34 42)" />
      <rect x="61" y="27" width="9" height="30" rx="4" fill={fill("shoulders")} transform="rotate(8 66 42)" />
      <rect x="24" y="55" width="8" height="30" rx="4" fill={fill("arms")} />
      <rect x="68" y="55" width="8" height="30" rx="4" fill={fill("arms")} />
      <rect x="40" y="60" width="20" height="26" rx="5" fill={fill("core")} />
      <rect x="36" y="86" width="12" height="34" rx="5" fill={fill("legs")} />
      <rect x="52" y="86" width="12" height="34" rx="5" fill={fill("legs")} />
      <rect x="38" y="30" width="24" height="10" rx="4" fill={on("back") ? accent : "transparent"} opacity="0.55" />
      {on("cardio") && <circle cx="50" cy="44" r="4" fill="#fff" opacity="0.85" />}
      {on("full") && <circle cx="50" cy="80" r="55" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.35" />}
    </svg>
  );
}

/* ============================== AUDIO (no external files) ============================== */
function useBeeper() {
  const ctxRef = useRef(null);
  const getCtx = () => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new AC();
    }
    return ctxRef.current;
  };
  const beep = useCallback((freq = 880, dur = 0.15, delay = 0, vol = 0.2) => {
    try {
      const ctx = getCtx();
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = vol;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch (e) { /* audio unavailable */ }
  }, []);
  const playEnd = useCallback(() => { beep(660, 0.14, 0); beep(660, 0.14, 0.18); beep(880, 0.22, 0.36); }, [beep]);
  const playTick = useCallback(() => beep(440, 0.05, 0, 0.08), [beep]);
  const playStart = useCallback(() => beep(520, 0.12, 0, 0.15), [beep]);
  return { playEnd, playTick, playStart };
}

/* ============================== THEME ============================== */
const ACCENTS = [
  { name: "Ember", value: "#E0562A" },
  { name: "Signal", value: "#D62839" },
  { name: "Track Teal", value: "#1E8A78" },
  { name: "Cobalt", value: "#2255C4" },
  { name: "Violet", value: "#7B4FE0" },
  { name: "Chalk Gold", value: "#C79A2E" },
];

function applyTheme(mode, accent) {
  const r = document.documentElement;
  r.style.setProperty("--accent", accent);
  if (mode === "dark") {
    r.style.setProperty("--bg", "#15151A");
    r.style.setProperty("--bg-elev", "#1D1D24");
    r.style.setProperty("--bg-elev2", "#26262F");
    r.style.setProperty("--text", "#F3F1EC");
    r.style.setProperty("--text-dim", "#9C9AA5");
    r.style.setProperty("--border", "#33333D");
    r.style.setProperty("--diagram-off", "#3A3A44");
    r.style.setProperty("--figure-body", "#55555F");
  } else {
    r.style.setProperty("--bg", "#F5F3EE");
    r.style.setProperty("--bg-elev", "#FFFFFF");
    r.style.setProperty("--bg-elev2", "#ECE9E1");
    r.style.setProperty("--text", "#1B1A18");
    r.style.setProperty("--text-dim", "#6B6862");
    r.style.setProperty("--border", "#DEDAD0");
    r.style.setProperty("--diagram-off", "#D8D4C8");
    r.style.setProperty("--figure-body", "#B7B2A4");
  }
}

/* ============================== SMALL UI PARTS ============================== */
function IconBtn({ onClick, children, label, danger }) {
  return (
    <button onClick={onClick} aria-label={label} className={`icon-btn ${danger ? "icon-btn-danger" : ""}`}>
      {children}
    </button>
  );
}
function Tag({ t, small }) {
  return <span className={`tag-pill ${small ? "tag-pill-sm" : ""}`}>{TAG_LABEL[t] || t}</span>;
}
function fmtTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

const DAY_DEFS = [
  { key: "sun", short: "Sun", full: "Sunday" }, { key: "mon", short: "Mon", full: "Monday" },
  { key: "tue", short: "Tue", full: "Tuesday" }, { key: "wed", short: "Wed", full: "Wednesday" },
  { key: "thu", short: "Thu", full: "Thursday" }, { key: "fri", short: "Fri", full: "Friday" },
  { key: "sat", short: "Sat", full: "Saturday" },
];
function newDay(key) { return { key, rest: true, context: "home", items: [] }; }
function todayIdx() { return new Date().getDay(); }

/* Storage adapter — uses window.storage when running inside a claude.ai artifact,
   falls back to localStorage everywhere else (StackBlitz, a real deployment, etc.)
   so the app doesn't crash the moment it tries to persist anything. */
const store = {
  async get(key) {
    if (typeof window !== "undefined" && window.storage && typeof window.storage.get === "function") {
      try { return await window.storage.get(key); } catch (e) { /* fall through to localStorage */ }
    }
    try {
      if (typeof localStorage === "undefined") return null;
      const v = localStorage.getItem(key);
      return v == null ? null : { key, value: v };
    } catch (e) { return null; }
  },
  async set(key, value) {
    if (typeof window !== "undefined" && window.storage && typeof window.storage.set === "function") {
      try { return await window.storage.set(key, value); } catch (e) { /* fall through to localStorage */ }
    }
    try {
      if (typeof localStorage === "undefined") return null;
      localStorage.setItem(key, value);
      return { key, value };
    } catch (e) { return null; }
  },
};


/* ============================== EXERCISE DETAIL SHEET ============================== */
function ExerciseSheet({ ex, onClose, onAdd, isAdded, accent }) {
  if (!ex) return null;
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-viewer-row"><Mannequin3D poseKey={ex.poseKey} accent={accent} size={260} /></div>
        <div className="sheet-top">
          <div className="sheet-top-text">
            <h2>{ex.name}</h2>
            <div className="tag-row">
              {ex.tags.map((t) => <Tag key={t} t={t} small />)}
              <span className="context-chip">{ex.context === "home" ? "🏠 Home" : "🏋️ Gym"}</span>
            </div>
            <div className="diff-row">
              {"●●●".split("").map((d, i) => <span key={i} className={i < ex.difficulty ? "diff-on" : "diff-off"}>●</span>)}
              <span className="diff-label">{["","Beginner","Intermediate","Advanced"][ex.difficulty]}</span>
            </div>
          </div>
        </div>
        <p className="sheet-desc">{ex.desc}</p>
        <div className="sheet-eq"><strong>Equipment:</strong> {ex.equipment}</div>
        <div className="cues-box">
          <div className="cues-title"><Info size={15} /> Form cues</div>
          <ul>{ex.cues.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>
        <div className="sheet-actions">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          {onAdd && (
            isAdded
              ? <button className="btn-secondary sheet-added-btn" disabled><Check size={16} /> Already in routine</button>
              : <button className="btn-primary" onClick={() => { onAdd(ex); onClose(); }}><Plus size={16} /> Add to routine</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================== LIBRARY TAB ============================== */
function LibraryTab({ onAdd, addedIds, accent }) {
  const [query, setQuery] = useState("");
  const [context, setContext] = useState("all");
  const [tag, setTag] = useState("all");
  const [detail, setDetail] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const handleAdd = (ex) => {
    onAdd(ex);
    try { navigator.vibrate && navigator.vibrate(12); } catch (e) { /* vibration unsupported */ }
    setToast(ex.name);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1600);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const filtered = useMemo(() => {
    return EXERCISES.filter((e) => {
      if (context !== "all" && e.context !== context) return false;
      if (tag !== "all" && !e.tags.includes(tag)) return false;
      if (query && !e.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [query, context, tag]);

  return (
    <div className="tab-pane">
      <div className="search-row">
        <Search size={16} className="search-icon" />
        <input placeholder={`Search ${EXERCISES.length} exercises…`} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="chip-row">
        {["all", "home", "gym"].map((c) => (
          <button key={c} className={`chip ${context === c ? "chip-active" : ""}`} onClick={() => setContext(c)}>
            {c === "all" ? "All" : c === "home" ? "🏠 Home" : "🏋️ Gym"}
          </button>
        ))}
      </div>
      <div className="chip-row chip-row-wrap">
        <button className={`chip ${tag === "all" ? "chip-active" : ""}`} onClick={() => setTag("all")}>All muscles</button>
        {TAGS.map((t) => (
          <button key={t} className={`chip ${tag === t ? "chip-active" : ""}`} onClick={() => setTag(t)}>{TAG_LABEL[t]}</button>
        ))}
      </div>
      <div className="lib-count">{filtered.length} exercises</div>
      <div className="ex-list">
        {filtered.slice(0, 200).map((ex) => {
          const isAdded = addedIds && addedIds.has(ex.id);
          return (
            <button key={ex.id} className={`ex-row ${isAdded ? "ex-row-added" : ""}`} onClick={() => setDetail(ex)}>
              <div className="ex-row-diagram"><BodyDiagram activeTags={ex.tags} accent={accent} /></div>
              <div className="ex-row-mid">
                <div className="ex-row-name">{ex.name}</div>
                <div className="ex-row-tags">
                  {ex.tags.slice(0, 3).map((t) => <Tag key={t} t={t} small />)}
                  <span className="context-chip context-chip-sm">{ex.context === "home" ? "🏠" : "🏋️"}</span>
                </div>
              </div>
              {isAdded && <span className="ex-row-added-badge"><Check size={14} /></span>}
              {onAdd && !isAdded && <span className="ex-row-add" onClick={(e) => { e.stopPropagation(); handleAdd(ex); }}><Plus size={18} /></span>}
            </button>
          );
        })}
        {filtered.length === 0 && <div className="empty-state">No exercises match. Try clearing a filter.</div>}
        {filtered.length > 200 && <div className="lib-count" style={{ textAlign: "center" }}>Showing first 200 — refine your search to narrow further</div>}
      </div>
      <ExerciseSheet ex={detail} onClose={() => setDetail(null)} onAdd={onAdd ? handleAdd : null} isAdded={detail && addedIds && addedIds.has(detail.id)} accent={accent} />
      {toast && <div className="add-toast"><Check size={14} /> Added "{toast}"</div>}
    </div>
  );
}

/* ============================== ROUTINE BUILDER (weekly) ============================== */
function emptyRoutineItem(ex) {
  return { uid: `${ex.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, exId: ex.id, name: ex.name, sets: 3, reps: 10, useTimer: false, workSeconds: 30, restSeconds: 60 };
}

function DayEditor({ day, setDay, accent }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const update = (uid, patch) => setDay((d) => ({ ...d, items: d.items.map((it) => (it.uid === uid ? { ...it, ...patch } : it)) }));
  const remove = (uid) => setDay((d) => ({ ...d, items: d.items.filter((it) => it.uid !== uid) }));
  const move = (idx, dir) => setDay((d) => {
    const items = [...d.items]; const j = idx + dir;
    if (j < 0 || j >= items.length) return d;
    [items[idx], items[j]] = [items[j], items[idx]];
    return { ...d, items };
  });
  const addExercise = (ex) => setDay((d) => ({ ...d, rest: false, items: [...d.items, emptyRoutineItem(ex)] }));
  const addedIds = useMemo(() => new Set(day.items.map((it) => it.exId)), [day.items]);

  if (day.rest) {
    return (
      <div className="rest-day-box">
        <Bed size={26} />
        <p>Rest day — no exercises scheduled.</p>
        <button className="btn-secondary" onClick={() => setDay((d) => ({ ...d, rest: false }))}><Plus size={16} /> Add a workout to this day</button>
      </div>
    );
  }

  return (
    <div>
      <div className="chip-row">
        <button className={`chip ${day.context === "home" ? "chip-active" : ""}`} onClick={() => setDay((d) => ({ ...d, context: "home" }))}>🏠 Home</button>
        <button className={`chip ${day.context === "gym" ? "chip-active" : ""}`} onClick={() => setDay((d) => ({ ...d, context: "gym" }))}>🏋️ Gym</button>
        <button className={`chip ${day.context === "mixed" ? "chip-active" : ""}`} onClick={() => setDay((d) => ({ ...d, context: "mixed" }))}>Mixed</button>
        <button className="chip" onClick={() => setDay((d) => ({ ...d, rest: true }))}><Bed size={13} /> Make rest day</button>
      </div>

      {day.items.length === 0 && <div className="empty-state">No exercises yet — add some below.</div>}

      <div className="builder-list">
        {day.items.map((it, idx) => (
          <div className="builder-card" key={it.uid}>
            <div className="builder-card-head">
              <div className="reorder-col">
                <button onClick={() => move(idx, -1)} disabled={idx === 0}><ChevronLeft size={14} style={{ transform: "rotate(90deg)" }} /></button>
                <GripVertical size={14} className="grip" />
                <button onClick={() => move(idx, 1)} disabled={idx === day.items.length - 1}><ChevronRight size={14} style={{ transform: "rotate(90deg)" }} /></button>
              </div>
              <div className="builder-card-title">{it.name}</div>
              <button className="icon-btn icon-btn-danger" onClick={() => remove(it.uid)}><Trash2 size={15} /></button>
            </div>
            <div className="builder-row">
              <label>Sets</label>
              <div className="stepper">
                <button onClick={() => update(it.uid, { sets: Math.max(1, it.sets - 1) })}><Minus size={13} /></button>
                <span>{it.sets}</span>
                <button onClick={() => update(it.uid, { sets: it.sets + 1 })}><Plus size={13} /></button>
              </div>
            </div>
            <div className="builder-row">
              <label>{it.useTimer ? "Work time" : "Reps"}</label>
              {it.useTimer ? (
                <div className="stepper">
                  <button onClick={() => update(it.uid, { workSeconds: Math.max(5, it.workSeconds - 5) })}><Minus size={13} /></button>
                  <span>{it.workSeconds}s</span>
                  <button onClick={() => update(it.uid, { workSeconds: it.workSeconds + 5 })}><Plus size={13} /></button>
                </div>
              ) : (
                <div className="stepper">
                  <button onClick={() => update(it.uid, { reps: Math.max(1, it.reps - 1) })}><Minus size={13} /></button>
                  <span>{it.reps}</span>
                  <button onClick={() => update(it.uid, { reps: it.reps + 1 })}><Plus size={13} /></button>
                </div>
              )}
              <button className="mini-toggle" onClick={() => update(it.uid, { useTimer: !it.useTimer })}>
                {it.useTimer ? "Use reps instead" : "Use timer instead"}
              </button>
            </div>
            <div className="builder-row">
              <label>Rest after</label>
              <div className="stepper">
                <button onClick={() => update(it.uid, { restSeconds: Math.max(0, it.restSeconds - 15) })}><Minus size={13} /></button>
                <span>{it.restSeconds}s</span>
                <button onClick={() => update(it.uid, { restSeconds: it.restSeconds + 15 })}><Plus size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn-secondary btn-full" onClick={() => setPickerOpen(true)}><Plus size={16} /> Add exercise</button>

      {pickerOpen && (
        <div className="sheet-overlay" onClick={() => setPickerOpen(false)}>
          <div className="sheet sheet-tall" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="picker-head">
              <h3>Add exercise</h3>
              <button className="icon-btn" onClick={() => setPickerOpen(false)}><X size={18} /></button>
            </div>
            <LibraryTab onAdd={addExercise} addedIds={addedIds} accent={accent} />
          </div>
        </div>
      )}
    </div>
  );
}

function RoutineEditor({ routine, setRoutine, onSave, onCancel, accent }) {
  const [selIdx, setSelIdx] = useState(() => todayIdx());
  const [copyOpen, setCopyOpen] = useState(false);
  const [copyTargets, setCopyTargets] = useState([]);

  const setDay = (updater) => {
    setRoutine((r) => {
      const days = [...r.days];
      days[selIdx] = typeof updater === "function" ? updater(days[selIdx]) : updater;
      return { ...r, days };
    });
  };

  const openCopy = () => { setCopyTargets([]); setCopyOpen(true); };
  const toggleCopyTarget = (i) => setCopyTargets((t) => (t.includes(i) ? t.filter((x) => x !== i) : [...t, i]));
  const applyCopy = () => {
    setRoutine((r) => {
      const days = [...r.days];
      const src = days[selIdx];
      copyTargets.forEach((i) => { days[i] = { ...src, key: days[i].key, items: src.items.map((it) => ({ ...it, uid: `${it.uid}-c${i}` })) }; });
      return { ...r, days };
    });
    setCopyOpen(false);
  };

  const day = routine.days[selIdx];
  const activeDaysCount = routine.days.filter((d) => !d.rest && d.items.length > 0).length;

  return (
    <div className="tab-pane">
      <input className="routine-name-input" value={routine.name} placeholder="Routine name" onChange={(e) => setRoutine((r) => ({ ...r, name: e.target.value }))} />
      <div className="week-strip">
        {DAY_DEFS.map((d, i) => {
          const dd = routine.days[i];
          const hasWorkout = !dd.rest && dd.items.length > 0;
          return (
            <button key={d.key} className={`week-day-btn ${selIdx === i ? "week-day-btn-active" : ""}`} onClick={() => setSelIdx(i)}
              style={selIdx === i ? { borderColor: accent } : {}}>
              <span className="week-day-label">{d.short}</span>
              <span className={`week-day-dot ${hasWorkout ? "week-day-dot-on" : ""}`} style={hasWorkout ? { background: accent } : {}} />
            </button>
          );
        })}
      </div>
      <div className="day-editor-head">
        <h3>{DAY_DEFS[selIdx].full}</h3>
        {!day.rest && day.items.length > 0 && (
          <button className="mini-toggle" onClick={openCopy}><Copy size={13} style={{ verticalAlign: "-2px" }} /> Copy to other days</button>
        )}
      </div>

      <DayEditor day={day} setDay={setDay} accent={accent} />

      <div className="sheet-actions" style={{ marginTop: 18 }}>
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={onSave} disabled={!routine.name.trim() || activeDaysCount === 0}><Save size={16} /> Save routine</button>
      </div>

      {copyOpen && (
        <div className="sheet-overlay" onClick={() => setCopyOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h3 style={{ fontFamily: "'Oswald',sans-serif", marginTop: 0 }}>Copy {DAY_DEFS[selIdx].full} to…</h3>
            <div className="copy-day-list">
              {DAY_DEFS.map((d, i) => i !== selIdx && (
                <label key={d.key} className="copy-day-row">
                  <input type="checkbox" checked={copyTargets.includes(i)} onChange={() => toggleCopyTarget(i)} />
                  {d.full}
                </label>
              ))}
            </div>
            <div className="sheet-actions">
              <button className="btn-secondary" onClick={() => setCopyOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={applyCopy} disabled={copyTargets.length === 0}>Copy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== ROUTINES LIST TAB ============================== */
function RoutinesTab({ routines, onCreate, onEdit, onDelete, onStart, accent }) {
  if (routines.length === 0) {
    return (
      <div className="tab-pane">
        <div className="empty-state big">
          <ListChecks size={32} />
          <p>No routines yet. Build a weekly split — a different workout (or a rest day) for each day of the week.</p>
          <button className="btn-primary" onClick={onCreate}><Plus size={16} /> New routine</button>
        </div>
      </div>
    );
  }
  const today = todayIdx();
  return (
    <div className="tab-pane">
      <button className="btn-primary btn-full" onClick={onCreate}><Plus size={16} /> New routine</button>
      <div className="routine-list">
        {routines.map((r) => (
          <div className="routine-card" key={r.id}>
            <div className="routine-card-top">
              <div>
                <div className="routine-card-name">{r.name}</div>
                <div className="routine-card-meta">{r.days.filter((d) => !d.rest && d.items.length).length} workout days / week</div>
              </div>
              <div className="routine-card-actions">
                <IconBtn label="Edit" onClick={() => onEdit(r)}><Edit3 size={15} /></IconBtn>
                <IconBtn label="Delete" danger onClick={() => onDelete(r.id)}><Trash2 size={15} /></IconBtn>
              </div>
            </div>
            <div className="week-strip week-strip-view">
              {DAY_DEFS.map((d, i) => {
                const dd = r.days[i];
                const has = !dd.rest && dd.items.length > 0;
                return (
                  <button key={d.key} className={`week-pill ${has ? "week-pill-on" : "week-pill-off"} ${i === today ? "week-pill-today" : ""}`}
                    style={has ? { background: accent, borderColor: accent } : {}}
                    disabled={!has}
                    onClick={() => onStart(r, i)}>
                    {d.short}
                  </button>
                );
              })}
            </div>
            {r.days[today] && !r.days[today].rest && r.days[today].items.length > 0 ? (
              <button className="btn-primary btn-full" onClick={() => onStart(r, today)}><Play size={16} /> Start today's workout</button>
            ) : (
              <div className="empty-state" style={{ padding: "10px 0" }}>No workout scheduled today — tap a highlighted day above to start it.</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== WORKOUT PLAYER ============================== */
function WorkoutPlayer({ session, onExit, accent, soundOn }) {
  const { items, title } = session;
  const [idx, setIdx] = useState(0);
  const [setNum, setSetNum] = useState(1);
  const [phase, setPhase] = useState("work");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  const { playEnd, playTick, playStart } = useBeeper();
  const intervalRef = useRef(null);

  const item = items[idx];
  const ex = EXERCISES.find((e) => e.id === item?.exId);
  const totalSets = items.reduce((s, it) => s + it.sets, 0);
  const doneSets = Object.values(completedSets).reduce((s, n) => s + n, 0);

  useEffect(() => { if (item && item.useTimer && phase === "work") setSecondsLeft(item.workSeconds); }, [idx, setNum]); // eslint-disable-line

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (running && ((phase === "work" && item?.useTimer) || phase === "rest")) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            if (soundOn) playEnd();
            clearInterval(intervalRef.current);
            setRunning(false);
            if (phase === "rest") advanceAfterRest(); else finishWorkSegment();
            return 0;
          }
          if (soundOn && s <= 4) playTick();
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, phase, item]); // eslint-disable-line

  function markSetComplete() { setCompletedSets((c) => ({ ...c, [item.uid]: (c[item.uid] || 0) + 1 })); finishWorkSegment(); }
  function finishWorkSegment() {
    if (item.restSeconds > 0) { setPhase("rest"); setSecondsLeft(item.restSeconds); setRunning(true); if (soundOn) playStart(); }
    else advanceAfterRest();
  }
  function advanceAfterRest() {
    setRunning(false);
    if (setNum < item.sets) { setSetNum((n) => n + 1); setPhase("work"); }
    else if (idx < items.length - 1) { setIdx((i) => i + 1); setSetNum(1); setPhase("work"); }
    else setPhase("done");
  }
  function skipRest() { clearInterval(intervalRef.current); setRunning(false); advanceAfterRest(); }

  if (phase === "done") {
    return (
      <div className="tab-pane player-done">
        <Flame size={40} color={accent} />
        <h2>Workout complete</h2>
        <p>{title} · {items.length} exercises · {totalSets} sets</p>
        <button className="btn-primary btn-full" onClick={onExit}>Done</button>
      </div>
    );
  }

  return (
    <div className="tab-pane player">
      <div className="player-top">
        <button className="icon-btn" onClick={onExit}><ArrowLeft size={18} /></button>
        <div className="player-progress-track"><div className="player-progress-fill" style={{ width: `${(doneSets / totalSets) * 100}%`, background: accent }} /></div>
        <span className="player-progress-label">{doneSets}/{totalSets} sets</span>
      </div>

      {phase === "rest" ? (
        <div className="player-center rest-mode">
          <div className="rest-label">REST</div>
          <div className="timer-big">{fmtTime(secondsLeft)}</div>
          <div className="next-up">Next: {ex.name} · Set {setNum < item.sets ? setNum + 1 : "1"}</div>
          <button className="btn-secondary btn-full" onClick={skipRest}>Skip rest</button>
        </div>
      ) : (
        <div className="player-center">
          <Mannequin3D poseKey={ex.poseKey} accent={accent} size={240} />
          <h2 className="player-ex-name">{ex.name}</h2>
          <div className="tag-row" style={{ justifyContent: "center" }}>{ex.tags.slice(0, 3).map((t) => <Tag key={t} t={t} small />)}</div>
          <div className="set-indicator">Set {setNum} of {item.sets}</div>

          {item.useTimer ? (
            <>
              <div className="timer-big">{fmtTime(secondsLeft)}</div>
              {!running ? (
                <button className="btn-primary btn-full" onClick={() => { setRunning(true); if (soundOn) playStart(); }}><Play size={16} /> Start</button>
              ) : (
                <button className="btn-secondary btn-full" onClick={() => setRunning(false)}><Pause size={16} /> Pause</button>
              )}
            </>
          ) : (
            <>
              <div className="reps-big">{item.reps} reps</div>
              <button className="btn-primary btn-full" onClick={markSetComplete}><Check size={18} /> Mark set complete</button>
            </>
          )}
          <details className="cues-inline">
            <summary>Form cues</summary>
            <ul>{ex.cues.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </details>
        </div>
      )}

      <div className="player-list">
        {items.map((it, i) => {
          const done = i < idx || (i === idx && (completedSets[it.uid] || 0) >= it.sets);
          const current = i === idx;
          return (
            <div key={it.uid} className={`player-list-row ${current ? "player-list-row-current" : ""}`}>
              <span className={`check-dot ${done ? "check-dot-done" : ""}`} style={done ? { background: accent, borderColor: accent } : {}}>{done && <Check size={11} color="#fff" />}</span>
              <span className="player-list-name">{it.name}</span>
              <span className="player-list-meta">{completedSets[it.uid] || 0}/{it.sets}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================== REST TIMER (standalone) ============================== */
function StandaloneRestTimer({ accent, soundOn }) {
  const [duration, setDuration] = useState(60);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const { playEnd, playTick, playStart } = useBeeper();
  const intervalRef = useRef(null);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) { clearInterval(intervalRef.current); setRunning(false); if (soundOn) playEnd(); return 0; }
          if (soundOn && s <= 4) playTick();
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]); // eslint-disable-line

  const setPreset = (v) => { setDuration(v); setSecondsLeft(v); setRunning(false); };
  const adjust = (d) => { const v = Math.max(5, duration + d); setDuration(v); setSecondsLeft(v); setRunning(false); };

  return (
    <div className="tab-pane">
      <div className="rest-standalone">
        <div className="rest-standalone-label">Rest timer</div>
        <div className="timer-big timer-huge">{fmtTime(secondsLeft)}</div>
        <div className="chip-row" style={{ justifyContent: "center" }}>
          {[30, 60, 90, 120].map((v) => (
            <button key={v} className={`chip ${duration === v ? "chip-active" : ""}`} onClick={() => setPreset(v)}>{v}s</button>
          ))}
        </div>
        <div className="stepper stepper-lg">
          <button onClick={() => adjust(-15)}><Minus size={16} /></button>
          <span>{duration}s total</span>
          <button onClick={() => adjust(15)}><Plus size={16} /></button>
        </div>
        <div className="sheet-actions">
          {!running ? (
            <button className="btn-primary btn-full" onClick={() => { if (secondsLeft === 0) setSecondsLeft(duration); setRunning(true); if (soundOn) playStart(); }}><Play size={16} /> Start</button>
          ) : (
            <button className="btn-secondary btn-full" onClick={() => setRunning(false)}><Pause size={16} /> Pause</button>
          )}
          <button className="btn-secondary" onClick={() => { setRunning(false); setSecondsLeft(duration); }}><RotateCcw size={16} /></button>
        </div>
      </div>
    </div>
  );
}

/* ============================== HEALTH TAB ============================== */
function HealthTab({ health, setHealth }) {
  const [stepsInput, setStepsInput] = useState("");
  const [waterInput, setWaterInput] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const todayLog = health.log[today] || { steps: 0, water: 0 };

  const logSteps = () => {
    const v = parseInt(stepsInput, 10);
    if (!isNaN(v)) { setHealth((h) => ({ ...h, log: { ...h.log, [today]: { ...(h.log[today] || {}), steps: v } } })); setStepsInput(""); }
  };
  const logWater = () => {
    const v = parseFloat(waterInput);
    if (!isNaN(v)) { setHealth((h) => ({ ...h, log: { ...h.log, [today]: { ...(h.log[today] || {}), water: ((h.log[today]?.water || 0) + v) } } })); setWaterInput(""); }
  };
  const days = Object.keys(health.log).sort().slice(-7);

  return (
    <div className="tab-pane">
      <div className="health-note">
        <Info size={14} />
        <span>This app can't read step counts directly from your phone's sensors — that requires native Health/Fit access a browser app doesn't have. Log manually here, or paste in a daily total from your phone's Health app.</span>
      </div>
      <div className="health-cards">
        <div className="health-card">
          <div className="health-card-icon"><Footprints size={20} /></div>
          <div className="health-card-value">{todayLog.steps.toLocaleString()}</div>
          <div className="health-card-label">steps today</div>
          <div className="health-input-row">
            <input type="number" placeholder="Add steps" value={stepsInput} onChange={(e) => setStepsInput(e.target.value)} />
            <button className="btn-primary" onClick={logSteps}>Log</button>
          </div>
        </div>
        <div className="health-card">
          <div className="health-card-icon"><Droplet size={20} /></div>
          <div className="health-card-value">{todayLog.water || 0}L</div>
          <div className="health-card-label">water today</div>
          <div className="health-input-row">
            <input type="number" step="0.1" placeholder="Add litres" value={waterInput} onChange={(e) => setWaterInput(e.target.value)} />
            <button className="btn-primary" onClick={logWater}>Log</button>
          </div>
        </div>
      </div>
      <div className="health-history">
        <div className="health-history-title"><TrendingUp size={15} /> Last 7 logged days</div>
        {days.length === 0 && <div className="empty-state">No entries yet.</div>}
        {days.map((d) => (
          <div key={d} className="health-history-row">
            <span>{d}</span>
            <span>{(health.log[d].steps || 0).toLocaleString()} steps</span>
            <span>{health.log[d].water || 0}L</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== SETTINGS TAB ============================== */
function SettingsTab({ mode, setMode, accent, setAccent, soundOn, setSoundOn }) {
  const [customHex, setCustomHex] = useState(accent);
  return (
    <div className="tab-pane">
      <div className="settings-section">
        <div className="settings-title">Appearance</div>
        <div className="mode-toggle">
          <button className={`mode-btn ${mode === "light" ? "mode-btn-active" : ""}`} onClick={() => setMode("light")}><Sun size={16} /> Light</button>
          <button className={`mode-btn ${mode === "dark" ? "mode-btn-active" : ""}`} onClick={() => setMode("dark")}><Moon size={16} /> Dark</button>
        </div>
      </div>
      <div className="settings-section">
        <div className="settings-title"><Palette size={15} /> Accent colour</div>
        <div className="accent-grid">
          {ACCENTS.map((a) => (
            <button key={a.value} className={`accent-swatch ${accent === a.value ? "accent-swatch-active" : ""}`} style={{ background: a.value }} onClick={() => setAccent(a.value)} aria-label={a.name} />
          ))}
        </div>
        <div className="custom-accent-row">
          <input type="color" value={customHex} onChange={(e) => setCustomHex(e.target.value)} />
          <button className="btn-secondary" onClick={() => setAccent(customHex)}>Use custom colour</button>
        </div>
      </div>
      <div className="settings-section">
        <div className="settings-title">Sound</div>
        <button className="mode-btn mode-btn-full" onClick={() => setSoundOn(!soundOn)}>
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />} {soundOn ? "Timer sounds on" : "Timer sounds off"}
        </button>
      </div>
      <div className="settings-section">
        <div className="settings-title">About</div>
        <p className="about-text">{EXERCISES.length} exercises in the library across 8 muscle groups, home and gym, each with a posture guide, description and form cues. Routines and preferences are saved to your account and sync back next time you open the app.</p>
      </div>
    </div>
  );
}

/* ============================== APP ROOT ============================== */
const NAV = [
  { key: "routines", label: "Routines", icon: ListChecks },
  { key: "library", label: "Library", icon: Dumbbell },
  { key: "timer", label: "Rest Timer", icon: RotateCcw },
  { key: "health", label: "Health", icon: Footprints },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

function migrateRoutine(r) {
  if (r.days && r.days.length === 7) return r;
  const legacyItems = r.items || [];
  const days = DAY_DEFS.map((d) => (legacyItems.length ? { key: d.key, rest: false, context: r.context || "mixed", items: legacyItems.map((it, i) => ({ ...it, uid: `${it.uid}-${d.key}` })) } : newDay(d.key)));
  return { id: r.id, name: r.name, days };
}

export default function App() {
  const [mode, setMode] = useState("dark");
  const [accent, setAccent] = useState(ACCENTS[0].value);
  const [soundOn, setSoundOn] = useState(true);
  const [tab, setTab] = useState("routines");
  const [routines, setRoutines] = useState([]);
  const [health, setHealth] = useState({ log: {} });
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [session, setSession] = useState(null); // { title, items }
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { applyTheme(mode, accent); }, [mode, accent]);

  useEffect(() => {
    (async () => {
      try {
        const prefs = await store.get("prefs");
        if (prefs?.value) {
          const p = JSON.parse(prefs.value);
          if (p.mode) setMode(p.mode);
          if (p.accent) setAccent(p.accent);
          if (typeof p.soundOn === "boolean") setSoundOn(p.soundOn);
        }
      } catch (e) {}
      try {
        const r = await store.get("routines-v2");
        if (r?.value) setRoutines(JSON.parse(r.value).map(migrateRoutine));
      } catch (e) {}
      try {
        const h = await store.get("health-log");
        if (h?.value) setHealth(JSON.parse(h.value));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) store.set("prefs", JSON.stringify({ mode, accent, soundOn })).catch(() => {}); }, [mode, accent, soundOn, loaded]);
  useEffect(() => { if (loaded) store.set("routines-v2", JSON.stringify(routines)).catch(() => {}); }, [routines, loaded]);
  useEffect(() => { if (loaded) store.set("health-log", JSON.stringify(health)).catch(() => {}); }, [health, loaded]);

  const startNewRoutine = () => setEditingRoutine({ id: `r-${Date.now()}`, name: "", days: DAY_DEFS.map((d) => newDay(d.key)) });
  const startEditRoutine = (r) => setEditingRoutine(JSON.parse(JSON.stringify(r)));
  const saveRoutine = () => {
    setRoutines((rs) => {
      const exists = rs.some((r) => r.id === editingRoutine.id);
      return exists ? rs.map((r) => (r.id === editingRoutine.id ? editingRoutine : r)) : [...rs, editingRoutine];
    });
    setEditingRoutine(null);
  };
  const deleteRoutine = (id) => setRoutines((rs) => rs.filter((r) => r.id !== id));
  const startDay = (r, dayIdx) => setSession({ title: `${r.name} · ${DAY_DEFS[dayIdx].full}`, items: r.days[dayIdx].items });

  let body;
  if (session) {
    body = <WorkoutPlayer session={session} onExit={() => setSession(null)} accent={accent} soundOn={soundOn} />;
  } else if (editingRoutine) {
    body = <RoutineEditor routine={editingRoutine} setRoutine={setEditingRoutine} onSave={saveRoutine} onCancel={() => setEditingRoutine(null)} accent={accent} />;
  } else if (tab === "routines") {
    body = <RoutinesTab routines={routines} onCreate={startNewRoutine} onEdit={startEditRoutine} onDelete={deleteRoutine} onStart={startDay} accent={accent} />;
  } else if (tab === "library") {
    body = <LibraryTab accent={accent} />;
  } else if (tab === "timer") {
    body = <StandaloneRestTimer accent={accent} soundOn={soundOn} />;
  } else if (tab === "health") {
    body = <HealthTab health={health} setHealth={setHealth} />;
  } else if (tab === "settings") {
    body = <SettingsTab mode={mode} setMode={setMode} accent={accent} setAccent={setAccent} soundOn={soundOn} setSoundOn={setSoundOn} />;
  }

  const headerTitle = session ? "Workout" : editingRoutine ? (routines.some((r) => r.id === editingRoutine.id) ? "Edit routine" : "New routine") : NAV.find((n) => n.key === tab)?.label;

  return (
    <div className="app-shell">
      <style>{CSS}</style>
      {!session && (
        <header className="app-header">
          <div className="app-header-brand"><Flame size={18} color={accent} /> <span>SETLIST</span></div>
          <div className="app-header-title">{headerTitle}</div>
        </header>
      )}
      <main className="app-main">{body}</main>
      {!session && !editingRoutine && (
        <nav className="bottom-nav">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <button key={n.key} className={`nav-btn ${tab === n.key ? "nav-btn-active" : ""}`} onClick={() => setTab(n.key)} style={tab === n.key ? { color: accent } : {}}>
                <Icon size={20} />
                <span>{n.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

/* ============================== STYLES ============================== */
const CSS = `
:root{ --accent:#E0562A; --figure-body:#8A8578; }
*{ box-sizing:border-box; }
button{ font:inherit; color:inherit; background:none; border:none; cursor:pointer; text-align:inherit; }
.app-shell{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background:var(--bg); color:var(--text); min-height:100vh; max-width:480px; margin:0 auto; display:flex; flex-direction:column; position:relative; }
.app-header{ padding:18px 18px 10px; border-bottom:1px solid var(--border); }
.app-header-brand{ display:flex; align-items:center; gap:6px; font-family:'Oswald',sans-serif; font-weight:600; letter-spacing:2px; font-size:13px; color:var(--text-dim); }
.app-header-title{ font-family:'Oswald',sans-serif; font-size:26px; font-weight:600; letter-spacing:-0.5px; margin-top:4px; }
.app-main{ flex:1; overflow-y:auto; padding-bottom:90px; }
.tab-pane{ padding:16px; }
.bottom-nav{ position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:100%; max-width:480px; display:flex; background:var(--bg-elev); border-top:1px solid var(--border); padding:8px 4px calc(8px + env(safe-area-inset-bottom)); }
.nav-btn{ flex:1; background:none; border:none; display:flex; flex-direction:column; align-items:center; gap:3px; padding:6px 2px; color:var(--text-dim); font-size:10px; font-family:'Inter',sans-serif; }
.nav-btn-active{ color:var(--accent); }
.search-row{ display:flex; align-items:center; gap:8px; background:var(--bg-elev); border:1px solid var(--border); border-radius:12px; padding:10px 12px; margin-bottom:12px; }
.search-row input{ border:none; background:none; outline:none; color:var(--text); flex:1; font-size:15px; }
.search-icon{ color:var(--text-dim); }
.chip-row{ display:flex; gap:8px; margin-bottom:10px; overflow-x:auto; }
.chip-row-wrap{ flex-wrap:wrap; overflow-x:visible; }
.chip{ background:var(--bg-elev); border:1px solid var(--border); color:var(--text); padding:7px 13px; border-radius:999px; font-size:13px; white-space:nowrap; display:inline-flex; align-items:center; gap:5px; }
.chip-active{ background:var(--accent); border-color:var(--accent); color:#fff; }
.lib-count{ font-size:12px; color:var(--text-dim); margin-bottom:8px; }
.ex-list{ display:flex; flex-direction:column; gap:8px; }
.ex-row{ display:flex; align-items:center; gap:10px; background:var(--bg-elev); border:1px solid var(--border); border-radius:14px; padding:10px; text-align:left; }
.ex-row-added{ border-color:var(--accent); background:color-mix(in srgb, var(--accent) 8%, var(--bg-elev)); }
.ex-row-added-badge{ background:var(--accent); border-radius:10px; padding:8px; color:#fff; display:flex; }
.ex-row-diagram{ width:34px; height:54px; flex-shrink:0; }
.body-diagram{ width:100%; height:100%; display:block; }
.ex-row-mid{ flex:1; min-width:0; }
.ex-row-name{ font-weight:600; font-size:14.5px; margin-bottom:4px; }
.ex-row-tags{ display:flex; gap:5px; flex-wrap:wrap; align-items:center; }
.ex-row-add{ background:var(--bg-elev2); border-radius:10px; padding:8px; color:var(--accent); }
.tag-pill{ background:var(--bg-elev2); color:var(--text-dim); font-size:11px; padding:3px 8px; border-radius:999px; }
.tag-pill-sm{ font-size:10px; padding:2px 7px; }
.context-chip{ font-size:11px; color:var(--text-dim); }
.context-chip-sm{ font-size:13px; }
.empty-state{ text-align:center; color:var(--text-dim); padding:30px 10px; font-size:14px; }
.add-toast{ position:fixed; bottom:96px; left:50%; transform:translateX(-50%); background:var(--accent); color:#fff; padding:10px 18px; border-radius:999px; font-size:13px; font-weight:600; display:flex; align-items:center; gap:7px; box-shadow:0 6px 20px rgba(0,0,0,0.35); z-index:60; max-width:85%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.empty-state.big{ display:flex; flex-direction:column; align-items:center; gap:12px; color:var(--text-dim); padding:60px 20px; }
.sheet-overlay{ position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:flex-end; z-index:50; max-width:480px; margin:0 auto; }
.sheet{ background:var(--bg-elev); width:100%; border-radius:20px 20px 0 0; padding:10px 18px 24px; max-height:85vh; overflow-y:auto; }
.sheet-tall{ max-height:90vh; }
.sheet-handle{ width:36px; height:4px; background:var(--border); border-radius:99px; margin:4px auto 14px; }
.sheet-top{ display:block; }
.player-center .mannequin-dual{ margin-bottom:8px; }
.sheet-top-text h2{ font-family:'Oswald',sans-serif; font-size:20px; margin:0 0 6px; }
.tag-row{ display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-bottom:6px; }
.diff-row{ display:flex; align-items:center; gap:4px; font-size:12px; }
.diff-on{ color:var(--accent); }
.diff-off{ color:var(--border); }
.diff-label{ color:var(--text-dim); margin-left:4px; }
.sheet-desc{ font-size:14px; line-height:1.5; color:var(--text); margin:16px 0 10px; }
.sheet-eq{ font-size:13px; color:var(--text-dim); margin-bottom:14px; }
.cues-box{ background:var(--bg-elev2); border-radius:12px; padding:12px 14px; }
.cues-title{ display:flex; align-items:center; gap:6px; font-weight:600; font-size:13px; margin-bottom:8px; }
.cues-box ul, .cues-inline ul{ margin:0; padding-left:18px; font-size:13.5px; line-height:1.6; color:var(--text); }
.sheet-actions{ display:flex; gap:10px; margin-top:18px; }
.btn-primary{ flex:1; background:var(--accent); color:#fff; border:none; border-radius:12px; padding:13px; font-weight:600; font-size:14.5px; display:flex; align-items:center; justify-content:center; gap:7px; }
.btn-primary:disabled{ opacity:0.4; }
.btn-secondary{ flex:1; background:var(--bg-elev2); color:var(--text); border:1px solid var(--border); border-radius:12px; padding:13px; font-weight:600; font-size:14.5px; display:flex; align-items:center; justify-content:center; gap:7px; }
.sheet-added-btn{ color:var(--accent); border-color:var(--accent); opacity:0.85; }
.btn-full{ width:100%; margin-bottom:14px; }
.picker-head{ display:flex; align-items:center; justify-content:space-between; padding:0 2px 8px; }
.picker-head h3{ font-family:'Oswald',sans-serif; font-size:19px; margin:0; }
.routine-name-input{ width:100%; background:var(--bg-elev); border:1px solid var(--border); border-radius:12px; padding:13px; font-size:17px; font-weight:600; color:var(--text); margin-bottom:14px; font-family:'Oswald',sans-serif; }
.week-strip{ display:flex; gap:6px; margin-bottom:14px; }
.week-day-btn{ flex:1; background:var(--bg-elev); border:1px solid var(--border); border-radius:10px; padding:8px 2px; display:flex; flex-direction:column; align-items:center; gap:5px; }
.week-day-btn-active{ background:var(--bg-elev2); }
.week-day-label{ font-size:11.5px; font-weight:600; color:var(--text); }
.week-day-dot{ width:6px; height:6px; border-radius:50%; background:var(--border); }
.week-day-dot-on{ }
.day-editor-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.day-editor-head h3{ font-family:'Oswald',sans-serif; font-size:18px; margin:0; }
.rest-day-box{ display:flex; flex-direction:column; align-items:center; gap:10px; color:var(--text-dim); text-align:center; padding:40px 10px; }
.builder-list{ display:flex; flex-direction:column; gap:10px; margin:10px 0; }
.builder-card{ background:var(--bg-elev); border:1px solid var(--border); border-radius:14px; padding:12px; }
.builder-card-head{ display:flex; align-items:center; gap:8px; margin-bottom:8px; }
.reorder-col{ display:flex; align-items:center; gap:2px; }
.reorder-col button{ background:none; border:none; color:var(--text-dim); padding:2px; }
.reorder-col button:disabled{ opacity:0.25; }
.grip{ color:var(--text-dim); }
.builder-card-title{ flex:1; font-weight:600; font-size:14.5px; }
.builder-row{ display:flex; align-items:center; gap:10px; padding:6px 0; flex-wrap:wrap; }
.builder-row label{ font-size:12.5px; color:var(--text-dim); width:64px; flex-shrink:0; }
.stepper{ display:flex; align-items:center; gap:10px; background:var(--bg-elev2); border-radius:10px; padding:5px 10px; }
.stepper button{ background:var(--bg-elev); border:1px solid var(--border); border-radius:7px; width:24px; height:24px; display:flex; align-items:center; justify-content:center; color:var(--text); }
.stepper span{ min-width:38px; text-align:center; font-weight:600; font-size:13.5px; }
.stepper-lg{ padding:8px 16px; justify-content:center; margin-bottom:14px; }
.stepper-lg button{ width:32px; height:32px; }
.mini-toggle{ margin-left:auto; background:none; border:none; color:var(--accent); font-size:11.5px; font-weight:600; text-decoration:underline; display:inline-flex; align-items:center; gap:4px; }
.icon-btn{ background:var(--bg-elev2); border:1px solid var(--border); border-radius:10px; padding:8px; color:var(--text); display:flex; align-items:center; justify-content:center; }
.icon-btn-danger{ color:#D62839; }
.copy-day-list{ display:flex; flex-direction:column; gap:10px; margin:14px 0; }
.copy-day-row{ display:flex; align-items:center; gap:10px; font-size:14px; }
.routine-list{ display:flex; flex-direction:column; gap:12px; margin-top:6px; }
.routine-card{ background:var(--bg-elev); border:1px solid var(--border); border-radius:16px; padding:14px; }
.routine-card-top{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
.routine-card-name{ font-family:'Oswald',sans-serif; font-size:18px; font-weight:600; }
.routine-card-meta{ font-size:12.5px; color:var(--text-dim); margin-top:2px; }
.routine-card-actions{ display:flex; gap:6px; }
.week-strip-view{ margin-bottom:12px; }
.week-pill{ flex:1; border-radius:8px; padding:8px 2px; font-size:11.5px; font-weight:600; border:1px solid var(--border); background:var(--bg-elev2); color:var(--text-dim); }
.week-pill-on{ color:#fff; }
.week-pill-today{ box-shadow:0 0 0 2px var(--text) inset; }
.player-top{ display:flex; align-items:center; gap:10px; padding:14px 16px 6px; }
.player-progress-track{ flex:1; height:6px; background:var(--bg-elev2); border-radius:99px; overflow:hidden; }
.player-progress-fill{ height:100%; border-radius:99px; transition:width .3s; }
.player-progress-label{ font-size:11.5px; color:var(--text-dim); white-space:nowrap; }
.player-center{ display:flex; flex-direction:column; align-items:center; text-align:center; padding:12px 16px 10px; gap:6px; }
.player-ex-name{ font-family:'Oswald',sans-serif; font-size:22px; margin:2px 0 4px; }
.set-indicator{ font-size:13px; color:var(--text-dim); margin:6px 0 2px; }
.timer-big{ font-family:'Oswald',sans-serif; font-size:52px; font-weight:600; margin:10px 0; letter-spacing:1px; }
.timer-huge{ font-size:72px; }
.reps-big{ font-family:'Oswald',sans-serif; font-size:40px; font-weight:600; margin:12px 0; }
.rest-mode{ padding-top:40px; }
.rest-label{ letter-spacing:4px; color:var(--text-dim); font-size:13px; font-weight:600; }
.next-up{ font-size:13.5px; color:var(--text-dim); margin-bottom:18px; }
.cues-inline{ width:100%; text-align:left; margin-top:14px; background:var(--bg-elev); border-radius:12px; padding:10px 14px; }
.cues-inline summary{ font-size:13px; font-weight:600; cursor:pointer; }
.player-list{ padding:10px 16px 20px; display:flex; flex-direction:column; gap:2px; }
.player-list-row{ display:flex; align-items:center; gap:10px; padding:9px 4px; border-bottom:1px solid var(--border); opacity:0.55; }
.player-list-row-current{ opacity:1; }
.check-dot{ width:20px; height:20px; border-radius:50%; border:2px solid var(--border); flex-shrink:0; display:flex; align-items:center; justify-content:center; }
.player-list-name{ flex:1; font-size:13.5px; }
.player-list-meta{ font-size:12px; color:var(--text-dim); }
.player-done{ display:flex; flex-direction:column; align-items:center; text-align:center; gap:10px; padding-top:80px; }
.player-done h2{ font-family:'Oswald',sans-serif; font-size:26px; margin:6px 0 0; }
.player-done p{ color:var(--text-dim); font-size:13.5px; margin-bottom:20px; }
.rest-standalone{ display:flex; flex-direction:column; align-items:center; text-align:center; padding-top:20px; }
.rest-standalone-label{ letter-spacing:3px; font-size:12px; color:var(--text-dim); font-weight:600; margin-bottom:6px; }
.health-note{ display:flex; gap:8px; background:var(--bg-elev2); border-radius:12px; padding:12px; font-size:12px; color:var(--text-dim); line-height:1.5; margin-bottom:14px; }
.health-cards{ display:flex; gap:10px; margin-bottom:16px; }
.health-card{ flex:1; background:var(--bg-elev); border:1px solid var(--border); border-radius:14px; padding:14px; text-align:center; }
.health-card-icon{ color:var(--accent); display:flex; justify-content:center; margin-bottom:6px; }
.health-card-value{ font-family:'Oswald',sans-serif; font-size:22px; font-weight:600; }
.health-card-label{ font-size:11px; color:var(--text-dim); margin-bottom:10px; }
.health-input-row{ display:flex; gap:6px; }
.health-input-row input{ width:0; flex:1; background:var(--bg-elev2); border:1px solid var(--border); border-radius:8px; padding:7px; color:var(--text); font-size:12.5px; }
.health-input-row button{ padding:7px 10px; font-size:12px; border-radius:8px; }
.health-history{ background:var(--bg-elev); border:1px solid var(--border); border-radius:14px; padding:14px; }
.health-history-title{ display:flex; align-items:center; gap:6px; font-weight:600; font-size:13px; margin-bottom:10px; }
.health-history-row{ display:flex; justify-content:space-between; font-size:12.5px; padding:6px 0; border-bottom:1px solid var(--border); color:var(--text-dim); }
.settings-section{ margin-bottom:22px; }
.settings-title{ display:flex; align-items:center; gap:6px; font-weight:600; font-size:14px; margin-bottom:10px; }
.mode-toggle{ display:flex; gap:10px; }
.mode-btn{ flex:1; background:var(--bg-elev); border:1px solid var(--border); border-radius:12px; padding:12px; display:flex; align-items:center; justify-content:center; gap:7px; color:var(--text); font-weight:600; font-size:13.5px; }
.mode-btn-active{ border-color:var(--accent); color:var(--accent); }
.mode-btn-full{ width:100%; }
.accent-grid{ display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px; }
.accent-swatch{ width:36px; height:36px; border-radius:50%; border:2px solid transparent; }
.accent-swatch-active{ border-color:var(--text); }
.custom-accent-row{ display:flex; gap:10px; align-items:center; }
.custom-accent-row input[type=color]{ width:44px; height:36px; border:none; background:none; padding:0; }
.about-text{ font-size:13px; color:var(--text-dim); line-height:1.6; }
.sheet-viewer-row{ display:flex; justify-content:center; margin-bottom:12px; }
.mannequin-dual{ position:relative; display:flex; gap:10px; justify-content:center; margin:0 auto; }
.mannequin-wrap{ position:relative; border-radius:16px; overflow:hidden; background:var(--bg-elev2); flex-shrink:0; }
.mannequin-canvas{ width:100%; height:100%; display:block; }
.mannequin-view-label{ position:absolute; bottom:6px; left:50%; transform:translateX(-50%); font-size:10px; font-weight:600; letter-spacing:0.5px; color:var(--text-dim); background:var(--bg-elev); padding:2px 8px; border-radius:999px; }
.mannequin-error{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; text-align:center; padding:14px; font-size:11.5px; color:var(--text-dim); background:var(--bg-elev2); border-radius:16px; z-index:2; }
@media (min-width:481px){ .app-shell{ min-height:100vh; box-shadow:0 0 0 1px var(--border); } }
`;
