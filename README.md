# Financial Universe

**Practice financial decisions before they cost you real money.**

Financial Universe is an interactive personal-finance simulation for young adults. Users build a simulated version of their financial circumstances, make decisions involving credit, retirement, saving, investing and debt, and then experience the consequences without risking real money.

**Live site (after GitHub Pages is enabled):**  
https://victoriaborja09.github.io/financial-universe/

## Product thesis

Financial information is everywhere. Financial judgment is harder to practice.

Financial Universe is built around a simple hypothesis:

> If young adults can use realistic financial tools, make meaningful choices and experience the consequences without risking real money, they can build greater understanding and confidence before making comparable decisions with their actual money.

The product does not try to turn finance into a points-based game.

**Do not gamify finance. Make finance playable.**

## Core loop

**Earn → Allocate → Experience → Learn → Experiment → Adjust**

The simulation represents one financial year. Instead of tracking every coffee, dinner or shopping transaction, it focuses on consequential financial resources, decisions and outcomes.

## Key product decisions

### Universe vs. Lab

**Universe** contains the decisions the user actually made. Orders, balances and consequences persist throughout the year.

**Lab** contains alternate realities. A Lab experiment can answer questions like:

- What if I bought VTI instead of NVIDIA?
- What if I paid down debt instead of investing?
- What if I contributed more to my 401(k)?
- What if I chose a different credit card?

Lab experiments never overwrite the user's Universe.

### Account = container

A recurring beginner misconception is that moving money into a Roth IRA or brokerage account automatically means it is invested.

Financial Universe deliberately separates:

**Account → cash inside account → investment purchased inside account**

This becomes an explicit interaction rather than a paragraph of financial education.

### No universal financial score

The product avoids:

- Correct / incorrect labels
- A single financial score
- XP, coins, lives or leaderboards
- Declaring one financial life universally better than another

Instead, it shows the tradeoff and lets the user compare another path.

## Year 1 missions

1. **Build Your Wallet**  
   Compare fictional credit-card products with different APRs, rewards, annual fees and foreign transaction fees.

2. **Put Your Paycheck to Work**  
   See gross pay flow through estimated taxes and baseline costs, then choose a 401(k) contribution while observing the employer match.

3. **Where Should Your Money Live?**  
   Allocate decision money among emergency savings, extra debt payments, Roth IRA, brokerage and checking.

4. **Put Your Money to Work**  
   Search a prototype security universe by ticker or name, choose the account the order comes from, review the order and place it.

5. **Unexpected Expense**  
   Replace a $1,800 laptop using a mix of emergency savings, credit and brokerage investments.

6. **Going Abroad**  
   Spend $1,500 overseas and experience how the credit-card decision from earlier in the year affects fees and rewards.

7. **Market Volatility**  
   Holdings experience mocked market moves. Users can hold, sell, add or open the Lab.

8. **Year-End Bonus**  
   Allocate a $5,000 after-tax bonus using the tools unlocked throughout the year.

9. **Money Wrap**  
   A narrative end-of-year summary with no grade, followed by **Replay Year 1**.

Replay preserves the original circumstances and resets every decision.

## Demo persona

The default demo uses:

- Age: 22
- Location: New York City
- Salary: $110,000
- Checking: $3,500
- Savings: $4,000
- Student debt: $15,000
- Monthly rent: $2,400
- Baseline personal spending: $2,000
- Employer 401(k) match: up to 4%
- No starting credit card

Users can also build a custom Universe.

## Prototype market

The current prototype includes a searchable local security set including:

VTI, VOO, SPY, QQQ, IWM, BND, TLT, NVDA, AAPL, MSFT, AMZN, GOOGL, META, TSLA, JPM, BAC, COST, KO, DIS and NFLX.

Market movements are deliberately labeled as **prototype/mock data**. The market-data layer is designed conceptually so that a future version could replace these values with a real market-data API.

## Implementation

This version is intentionally dependency-free:

- HTML
- CSS
- Vanilla JavaScript
- Local browser storage for simulation state
- GitHub Pages-ready static hosting

This keeps the portfolio prototype easy to inspect, fork and deploy without a paid build platform or backend.

## My role

**Victoria Borja — Product concept, research, UX and prototype**

I developed the product thesis, financial decision architecture, mission system, educational philosophy, Universe vs. Lab model, progression logic and iterative UX direction.

Implementation was created with AI-assisted development. The goal of the project is to demonstrate product judgment and the ability to turn a product hypothesis into a working, testable experience rather than to represent hand-written software engineering work.

## What I would test next

The first version is designed to test whether:

1. Users prefer manipulating financial decisions to passively reading financial lessons.
2. Experiencing realistic consequences makes concepts more memorable.
3. Users voluntarily use the Lab to compare alternate paths.
4. Users return to see how simulated market positions changed.
5. Users want to replay the same year using different choices.
6. Users report greater confidence making comparable real-world financial decisions.

## Run locally

Because the project is static, clone the repository and open `index.html` in a browser, or serve the directory with any basic local web server.

No API keys, database or package installation are required for the current prototype.

---

Educational simulation only. No real money, bank connections, credit applications or financial advice.
