      /* bounded-plan-v247: exact reachability, then original lexicographic preference */
      function m2PlanWithLengths(railLength, hasExtra, footLengths, braceLengths, fineTune, fineTarget = "") {
        if(!Number.isSafeInteger(railLength)||railLength<0||railLength>30*footLengths[0]+(hasExtra?30:29)*braceLengths[0])return null;
        const gcd=(a,b)=>b?gcd(b,a%b):a;
        const unit=[...footLengths,...braceLengths].reduce(gcd,0);
        if(!unit||railLength%unit)return null;
        const target=railLength/unit,mask=(1n<<BigInt(target+1))-1n;
        const footSteps=footLengths.map(n=>BigInt(n/unit)),braceSteps=braceLengths.map(n=>BigInt(n/unit));
        const extend=(bits,steps)=>{let result=0n;for(const step of steps)result|=bits<<step;return result&mask;};
        const has=(bits,total)=>total>=0&&total%unit===0&&((bits>>BigInt(total/unit))&1n)!==0n;
        const braceRows=[1n];
        const braceRow=count=>{while(braceRows.length<=count)braceRows.push(extend(braceRows[braceRows.length-1],braceSteps));return braceRows[count];};
        for(let footCount=1;footCount<=30;footCount++){
          const braceCount=hasExtra?footCount:footCount-1;
          if(railLength<footCount*footLengths.at(-1)+braceCount*braceLengths.at(-1)||railLength>footCount*footLengths[0]+braceCount*braceLengths[0])continue;
          const mixed=[braceRow(braceCount)];
          for(let n=1;n<=footCount;n++)mixed.push(extend(mixed[n-1],footSteps));
          if(!has(mixed[footCount],railLength))continue;
          let remaining=railLength;const feet=[],braces=[];
          for(let n=footCount;n>0;n--){const length=footLengths.find(value=>has(mixed[n-1],remaining-value));feet.push(length);remaining-=length;}
          for(let n=braceCount;n>0;n--){const length=braceLengths.find(value=>has(braceRow(n-1),remaining-value));braces.push(length);remaining-=length;}
          return {feet,braces,fineTune,fineTarget};
        }
        return null;
      }
      const m2PlanCacheV247=new Map();
      function m2Plan(railLength, hasExtra) {
        const key=railLength+'|'+Boolean(hasExtra);
        if(!m2PlanCacheV247.has(key)){
          const plan=m2PlanWithLengths(railLength,hasExtra,m2StandardLengths,m2StandardLengths,false)||m2PlanWithLengths(railLength,hasExtra,m2StandardLengths,m2FineLengths,true,'brace')||m2PlanWithLengths(railLength,hasExtra,m2FineLengths,m2FineLengths,true,'both');
          if(m2PlanCacheV247.size>=128)m2PlanCacheV247.delete(m2PlanCacheV247.keys().next().value);
          m2PlanCacheV247.set(key,plan);
        }
        const plan=m2PlanCacheV247.get(key);return plan?{...plan,feet:[...plan.feet],braces:[...plan.braces]}:null;
      }
