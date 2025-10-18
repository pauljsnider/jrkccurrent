/**
 * Junior Current Website
 * Awards Page Functionality
 */

// Fall 2025 Season Awards (based on PowerPoint presentation)
const fall2025Awards = [
    {
        title: "Rookie of the Year",
        recipient: "Vivian Karpuk",
        description: "Composed and reliable mid-fielder who reads the game exceptionally well, providing solid coverage with smart positioning. Her steady presence and soccer intelligence were crucial to the team's defensive success."
    },
    {
        title: "Golden Boot",
        recipient: "Audrey Sweany",
        description: "Fierce, focused, and fearless in front of goal, bringing a striker's mentality and sharp instincts to every match. Her multiple crucial goals showcased her clinical finishing ability."
    },
    {
        title: "Clutch Player Award",
        recipient: "Emersyn Karpuk",
        description: "Shined with tireless energy and selfless play, making key contributions everywhere on the field. Her perfect corner kicks and crucial equalizer showcased her ability to deliver in clutch moments."
    },
    {
        title: "Dynamic Attacker",
        recipient: "Harper Sleddens",
        description: "Brought dynamic energy and creativity to the attacking third with natural instincts and speed. Her team-first attitude and attacking flair made her a constant threat on offense."
    },
    {
        title: "Up and Coming Defender",
        recipient: "Liviana Hodges",
        description: "Everywhere on the field with steady and thoughtful play. Her four huge blocks and saves in the Storm match earned her Player of the Game honors and showcased her defensive prowess."
    },
    {
        title: "Breakaway Player of the Year",
        recipient: "Madison Snider",
        description: "Energetic and vocal, pushing the team forward with relentless pace on both ends of the field. Her assist for the game-winning goal and strong goalkeeping showed her incredible versatility."
    },
    {
        title: "Heart & Hustle Award",
        recipient: "Neda Andonovic",
        description: "Demonstrated incredible determination and versatility throughout the season, contributing on both defense and offense. Her hard work and positive attitude made her vital to the team's success."
    },
    {
        title: "Playmaker of the Year",
        recipient: "Payton Sleddens",
        description: "Visionary playmaker who sees passing lanes others miss and consistently sets the tempo. Her opening goal against the Storm and dangerous set pieces created numerous scoring opportunities."
    },
    {
        title: "Ultimate Team Player",
        recipient: "Saavya Kulhari",
        description: "The ultimate team player with composure and grit, stepping into any position needed. Her six recorded hustle plays in a single half exemplified her relentless work rate and team dedication."
    },
    {
        title: "Game Intelligence Award",
        recipient: "Sela Pahulu",
        description: "Displayed smart and intuitive play with exceptional game sense. Her relentless hustle, multiple blocks, and ability to contribute in defense and offense showcased her versatility and tactical awareness."
    },
    {
        title: "Defensive Player of the Year",
        recipient: "Teagan Kurtz",
        description: "Established herself as the backbone of the defense with solid and steady play. Her penalty kick goal, seamless transition to goalkeeper, and multiple Player of the Game honors demonstrated incredible versatility."
    }
];

// Spring 2025 Season Awards (previous awards)
const spring2025Awards = [
    {
        title: "Golden Boot",
        recipient: "Audrey",
        description: "Awarded to the team's top goal scorer for exceptional finishing ability and offensive impact."
    },
    {
        title: "Assist Queen",
        recipient: "Payton",
        description: "Recognizes the player who created the most scoring opportunities through precise passing and vision."
    },
    {
        title: "Defensive Rock",
        recipient: "Teagan",
        description: "Honors the defender whose consistent performance formed the foundation of the team's defensive structure."
    },
    {
        title: "Goalkeeper of the Year",
        recipient: "Neda",
        description: "Celebrates exceptional shot-stopping ability, command of the penalty area, and leadership from the back."
    },
    {
        title: "Most Versatile Player",
        recipient: "Saavya",
        description: "Recognizes the player who excelled in multiple positions, demonstrating tactical flexibility and diverse skills."
    },
    {
        title: "Most Improved Player",
        recipient: "Livy",
        description: "Honors the player who showed the greatest development in skills, game understanding, and overall performance."
    },
    {
        title: "Clutch Player of the Year",
        recipient: "Madison",
        description: "Awarded to the player who consistently performed at her best in critical moments and high-pressure situations."
    },
    {
        title: "Comeback Player of the Year",
        recipient: "Riley",
        description: "Celebrates resilience and determination in overcoming challenges to return to top form."
    },
    {
        title: "Sparkplug Award",
        recipient: "Adeline",
        description: "Recognizes the player whose energy, enthusiasm, and effort consistently lifted the team's performance."
    },
    {
        title: "Iron Woman",
        recipient: "Emmie",
        description: "Honors exceptional durability, consistency, and reliability throughout the season."
    },
    {
        title: "Game Changer",
        recipient: "Sela",
        description: "Awarded to the player whose contributions regularly altered the course of matches in the team's favor."
    }
];

/**
 * Generate HTML for award cards
 */
function generateAwardCards(awards, containerId) {
    const awardCardsContainer = document.getElementById(containerId);
    
    if (!awardCardsContainer) {
        console.error(`Award cards container ${containerId} not found`);
        return;
    }
    
    // Clear existing content
    awardCardsContainer.innerHTML = '';
    
    // Generate award cards
    awards.forEach(award => {
        const awardCard = document.createElement('div');
        awardCard.className = 'award-card';
        
        awardCard.innerHTML = `
            <div class="award-title">${award.title}</div>
            <div class="award-recipient">${award.recipient}</div>
            <div class="award-description">${award.description}</div>
        `;
        
        awardCardsContainer.appendChild(awardCard);
    });
}

/**
 * Handle season tab switching
 */
function initSeasonTabs() {
    const tabs = document.querySelectorAll('.season-tab');
    const seasonSections = document.querySelectorAll('.season-awards');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const season = tab.getAttribute('data-season');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active season section
            seasonSections.forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(`${season}-awards`).classList.add('active');
        });
    });
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    generateAwardCards(fall2025Awards, 'fall2025-cards');
    generateAwardCards(spring2025Awards, 'spring2025-cards');
    initSeasonTabs();
});