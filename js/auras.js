// js/auras.js - COMPLETE
const AURAS = {
  focus:        { name:'Focus',        emoji:'🎯',   accent:'#ff6b6b', desc:'Concentration', tasks:['Deep work 25 min','No phone 1 hour','Single-task','Clear desk','Pomodoro'] },
  creativity:   { name:'Creativity',   emoji:'🎨',   accent:'#f06595', desc:'Imagination',   tasks:['Free-write 10 min','Sketch/doodle','Brainstorm','New music','Rearrange'] },
  discipline:   { name:'Discipline',   emoji:'🧘',   accent:'#748ffc', desc:'Self-control',  tasks:['Wake up on time','Morning routine','Say no','Priority task','Reflection'] },
  vitality:     { name:'Vitality',     emoji:'⚡',   accent:'#ffd43b', desc:'Energy',        tasks:['Exercise 30 min','8 glasses water','Whole foods','Cold shower','Stretch'] },
  empathy:      { name:'Empathy',      emoji:'🤝',   accent:'#ff8787', desc:'Connection',    tasks:['Listen fully','Ask feelings','Validate','Active listening','Compliment'] },
  resilience:   { name:'Resilience',   emoji:'🛡️',   accent:'#20c997', desc:'Bounce back',   tasks:['Reframe','Gratitude','Do hard thing','Journal','Mental break'] },
  clarity:      { name:'Clarity',      emoji:'🔮',   accent:'#b197fc', desc:'Clear mind',    tasks:['Meditate','Top priorities','Declutter','Digital detox','Review goals'] },
  charisma:     { name:'Charisma',     emoji:'✨',   accent:'#f783ac', desc:'Presence',      tasks:['Smile','Tell story','Eye contact','Open posture','Make laugh'] },
  courage:      { name:'Courage',      emoji:'🦁',   accent:'#ff922b', desc:'Face fears',    tasks:['Do scary thing','Speak up','Try new','Admit mistake','Stand up'] },
  patience:     { name:'Patience',     emoji:'⏳',   accent:'#a9e34b', desc:'Steady',        tasks:['Wait','Let others','Deep breath','Accept delays','Count to 10'] },
  gratitude:    { name:'Gratitude',    emoji:'🙏',   accent:'#e599f7', desc:'Appreciate',    tasks:['3 gratitudes','Thank someone','Notice joys','Nature','Reflect'] },
  ambition:     { name:'Ambition',     emoji:'🚀',   accent:'#f03e3e', desc:'Drive',         tasks:['Bold goal','Take action','Network','Learn skill','Visualize'] },
  mindfulness:  { name:'Mindfulness',  emoji:'🧘‍♀️', accent:'#63e6be', desc:'Present',       tasks:['Body scan','Eat mindfully','5 senses','Mindful walk','Observe'] },
  leadership:   { name:'Leadership',   emoji:'👑',   accent:'#f59e0b', desc:'Inspire',       tasks:['Delegate','Give direction','Recognize','Decide','Lead'] },
  adventure:    { name:'Adventure',    emoji:'🏔️',   accent:'#3b82f6', desc:'Explore',       tasks:['New place','New food','Say yes','Break routine','Plan'] }
};

function getTasks() {
  let tasks = [];
  if (Nexus && Nexus.state && Nexus.state.selectedAuras) {
    Nexus.state.selectedAuras.forEach(key => {
      if (AURAS[key]) tasks = tasks.concat(AURAS[key].tasks);
    });
  }
  return [...new Set(tasks)].slice(0, 8);
}