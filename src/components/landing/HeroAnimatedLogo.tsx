/**
 * Hero Animated Vector Logo Component for Mehfooz
 * @license Apache-2.0
 */

import React from 'react';

interface HeroAnimatedLogoProps {
  showUrdu?: boolean;
  className?: string;
}

export const HeroAnimatedLogo: React.FC<HeroAnimatedLogoProps> = ({
  showUrdu = true,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center text-center space-y-3 select-none ${className}`}>
      {/* Embedded Animation Styles */}
      <style>{`
        .hero-stage {
          width: min(88vw, 340px);
          aspect-ratio: 1 / 1;
          position: relative;
          overflow: visible;
        }

        .hero-stage svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        /* ============ ENTRANCE (outer group): long streak-in from far away ============ */
        .enter-hand {
          opacity: 0;
          transform: translate(1300px, -1100px) rotate(70deg) scale(3.4, 0.35);
          animation: streakIn 1.15s cubic-bezier(.11, .8, .15, 1) .1s forwards;
        }
        .enter-face {
          opacity: 0;
          transform: translate(1250px, 650px) rotate(-55deg) scale(3.2, 0.35);
          animation: streakIn 1.2s cubic-bezier(.11, .8, .15, 1) .55s forwards;
        }
        .enter-inner {
          opacity: 0;
          transform: translate(500px, 1150px) rotate(80deg) scale(3, 0.3);
          animation: streakIn 1.05s cubic-bezier(.11, .8, .15, 1) 1.55s forwards;
        }
        .enter-light {
          opacity: 0;
          transform: translate(-1250px, 950px) rotate(-65deg) scale(3.2, 0.35);
          animation: streakIn 1.2s cubic-bezier(.11, .8, .15, 1) .75s forwards;
        }
        .enter-dark {
          opacity: 0;
          transform: translate(-1350px, -380px) rotate(50deg) scale(3.4, 0.35);
          animation: streakIn 1.25s cubic-bezier(.11, .8, .15, 1) .35s forwards;
        }

        @keyframes streakIn {
          0%   { opacity: 0; filter: blur(22px); }
          10%  { opacity: 1; }
          55%  { filter: blur(6px); }
          82%  { transform: translate(0, 0) rotate(-4deg) scale(0.9, 1.15); filter: blur(1px); }
          92%  { transform: translate(0, 0) rotate(2deg) scale(1.04, 0.97); filter: blur(0px); }
          100% { transform: translate(0, 0) rotate(0deg) scale(1, 1); opacity: 1; filter: blur(0px); }
        }

        /* ============ IDLE (inner group): hair sway and hand stroke ============ */
        .sway-dark {
          transform-origin: 76% 30%;
          animation: haveSway 4.6s cubic-bezier(.45, 0, .55, 1) 1.6s 1 both;
        }
        .sway-light {
          transform-origin: 74% 42%;
          animation: haveSway 4.8s cubic-bezier(.45, 0, .55, 1) 2s 1 both;
        }
        .sway-inner {
          transform-origin: 68% 55%;
          animation: haveSwaySmall 3.6s cubic-bezier(.45, 0, .55, 1) 2.6s 1 both;
        }

        @keyframes haveSway {
          0%   { transform: rotate(0deg) translateX(0); }
          8%   { transform: rotate(6deg) translateX(10px); }
          18%  { transform: rotate(-5deg) translateX(-9px); }
          30%  { transform: rotate(4.5deg) translateX(8px); }
          42%  { transform: rotate(-3.5deg) translateX(-6px); }
          55%  { transform: rotate(2.5deg) translateX(4px); }
          68%  { transform: rotate(-1.5deg) translateX(-2.5px); }
          80%  { transform: rotate(1deg) translateX(1.5px); }
          90%  { transform: rotate(-0.4deg) translateX(-0.5px); }
          100% { transform: rotate(0deg) translateX(0); }
        }

        @keyframes haveSwaySmall {
          0%   { transform: rotate(0deg); }
          10%  { transform: rotate(5deg); }
          24%  { transform: rotate(-4deg); }
          40%  { transform: rotate(3deg); }
          58%  { transform: rotate(-2deg); }
          75%  { transform: rotate(1deg); }
          100% { transform: rotate(0deg); }
        }

        /* Hand slow stroke motion */
        .sway-hand {
          transform-origin: 15% 90%;
          animation: strokeMotion 2.6s ease-in-out 1.4s infinite;
        }

        @keyframes strokeMotion {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%     { transform: translateY(14px) rotate(-2deg); }
        }

        .glow-effect {
          animation: pulseGlow 2.6s ease-in-out 2.2s infinite;
        }

        @keyframes pulseGlow {
          0%, 100% { filter: drop-shadow(0 0 0px rgba(240, 112, 90, 0)); }
          50%     { filter: drop-shadow(0 0 16px rgba(240, 112, 90, 0.4)); }
        }
      `}</style>

      {/* Hero Animated SVG Stage */}
      <div className="hero-stage">
        <svg viewBox="0 0 1254 1254">
          <g className="glow-effect" fillRule="nonzero">

            <g className="enter-dark">
              <g className="sway-dark">
                <path fill="#036366" d="M 762.0,262.0 L 758.0,267.0 L 757.0,285.0 L 747.0,318.0 L 729.0,351.0 L 704.0,382.0 L 658.0,424.0 L 577.0,481.0 L 516.0,529.0 L 468.0,578.0 L 433.0,625.0 L 404.0,681.0 L 392.0,717.0 L 386.0,746.0 L 384.0,772.0 L 386.0,804.0 L 394.0,839.0 L 405.0,863.0 L 406.0,859.0 L 402.0,844.0 L 398.0,811.0 L 399.0,768.0 L 405.0,736.0 L 415.0,702.0 L 428.0,672.0 L 437.0,656.0 L 470.0,608.0 L 495.0,580.0 L 521.0,555.0 L 554.0,527.0 L 668.0,443.0 L 690.0,424.0 L 719.0,394.0 L 745.0,357.0 L 757.0,332.0 L 763.0,314.0 L 767.0,292.0 L 766.0,268.0 Z" />
              </g>
            </g>

            <g className="enter-light">
              <g className="sway-light">
                <path fill="#6AA2A1" d="M 758.0,405.0 L 750.0,438.0 L 736.0,471.0 L 718.0,501.0 L 696.0,529.0 L 674.0,552.0 L 652.0,571.0 L 623.0,592.0 L 547.0,641.0 L 509.0,672.0 L 484.0,698.0 L 465.0,722.0 L 442.0,763.0 L 432.0,789.0 L 425.0,818.0 L 423.0,837.0 L 423.0,866.0 L 428.0,901.0 L 436.0,927.0 L 458.0,972.0 L 482.0,1006.0 L 516.0,1041.0 L 540.0,1059.0 L 505.0,1023.0 L 480.0,990.0 L 465.0,964.0 L 451.0,932.0 L 443.0,902.0 L 440.0,879.0 L 440.0,844.0 L 447.0,806.0 L 456.0,781.0 L 470.0,753.0 L 487.0,728.0 L 513.0,699.0 L 555.0,664.0 L 633.0,613.0 L 663.0,591.0 L 681.0,575.0 L 708.0,546.0 L 732.0,511.0 L 748.0,477.0 L 757.0,442.0 L 759.0,420.0 Z" />
              </g>
            </g>

            <g className="enter-face">
              <path fill="#F57C65" d="M 785.0,336.0 L 807.0,365.0 L 824.0,392.0 L 832.0,408.0 L 843.0,438.0 L 848.0,466.0 L 847.0,494.0 L 841.0,520.0 L 841.0,541.0 L 844.0,551.0 L 860.0,574.0 L 909.0,624.0 L 912.0,630.0 L 912.0,639.0 L 905.0,648.0 L 882.0,660.0 L 872.0,671.0 L 871.0,682.0 L 880.0,704.0 L 880.0,710.0 L 875.0,716.0 L 861.0,721.0 L 856.0,726.0 L 858.0,731.0 L 868.0,736.0 L 870.0,746.0 L 857.0,758.0 L 852.0,768.0 L 852.0,783.0 L 857.0,806.0 L 857.0,815.0 L 852.0,830.0 L 845.0,837.0 L 837.0,842.0 L 826.0,845.0 L 803.0,845.0 L 781.0,841.0 L 748.0,840.0 L 722.0,844.0 L 701.0,851.0 L 680.0,861.0 L 648.0,886.0 L 637.0,898.0 L 618.0,926.0 L 609.0,948.0 L 604.0,973.0 L 604.0,999.0 L 609.0,1020.0 L 619.0,1042.0 L 633.0,1061.0 L 649.0,1076.0 L 678.0,1093.0 L 680.0,1093.0 L 672.0,1088.0 L 671.0,1085.0 L 656.0,1072.0 L 644.0,1058.0 L 627.0,1031.0 L 621.0,1015.0 L 617.0,996.0 L 617.0,976.0 L 621.0,955.0 L 631.0,931.0 L 646.0,909.0 L 666.0,889.0 L 689.0,873.0 L 710.0,863.0 L 744.0,855.0 L 828.0,858.0 L 847.0,853.0 L 857.0,846.0 L 866.0,835.0 L 871.0,820.0 L 871.0,801.0 L 866.0,782.0 L 866.0,772.0 L 868.0,768.0 L 883.0,754.0 L 885.0,749.0 L 885.0,738.0 L 881.0,729.0 L 887.0,725.0 L 895.0,715.0 L 895.0,701.0 L 887.0,685.0 L 886.0,676.0 L 890.0,671.0 L 913.0,658.0 L 921.0,650.0 L 925.0,641.0 L 925.0,627.0 L 919.0,615.0 L 872.0,567.0 L 863.0,555.0 L 857.0,542.0 L 856.0,522.0 L 862.0,495.0 L 863.0,466.0 L 858.0,439.0 L 850.0,417.0 L 826.0,377.0 L 815.0,364.0 Z" />
            </g>

            <g className="enter-inner">
              <g className="sway-inner">
                <path fill="#F67B65" d="M 739.0,554.0 L 717.0,589.0 L 679.0,629.0 L 658.0,646.0 L 595.0,689.0 L 557.0,718.0 L 529.0,745.0 L 512.0,766.0 L 501.0,783.0 L 488.0,809.0 L 480.0,832.0 L 475.0,864.0 L 476.0,894.0 L 480.0,913.0 L 489.0,938.0 L 498.0,954.0 L 488.0,913.0 L 487.0,880.0 L 490.0,858.0 L 495.0,839.0 L 511.0,801.0 L 530.0,773.0 L 557.0,743.0 L 581.0,722.0 L 662.0,660.0 L 695.0,629.0 L 720.0,597.0 L 733.0,573.0 Z" />
              </g>
            </g>

            <g className="enter-hand">
              <g className="sway-hand">
                <path fill="#F67D67" d="M 965.0,295.0 L 925.0,262.0 L 851.0,190.0 L 836.0,179.0 L 814.0,170.0 L 774.0,160.0 L 692.0,133.0 L 675.0,130.0 L 640.0,131.0 L 611.0,141.0 L 588.0,154.0 L 560.0,173.0 L 558.0,176.0 L 550.0,180.0 L 477.0,239.0 L 442.0,265.0 L 402.0,290.0 L 345.0,318.0 L 322.0,334.0 L 305.0,351.0 L 292.0,369.0 L 278.0,396.0 L 272.0,415.0 L 274.0,414.0 L 288.0,387.0 L 302.0,367.0 L 316.0,351.0 L 338.0,333.0 L 368.0,317.0 L 402.0,302.0 L 437.0,282.0 L 462.0,265.0 L 551.0,195.0 L 592.0,166.0 L 619.0,151.0 L 644.0,143.0 L 671.0,142.0 L 685.0,144.0 L 823.0,186.0 L 847.0,202.0 L 901.0,254.0 L 950.0,295.0 L 943.0,298.0 L 928.0,298.0 L 909.0,293.0 L 896.0,287.0 L 877.0,273.0 L 818.0,219.0 L 803.0,213.0 L 776.0,208.0 L 769.0,200.0 L 752.0,195.0 L 720.0,196.0 L 680.0,204.0 L 637.0,217.0 L 566.0,243.0 L 561.0,246.0 L 579.0,244.0 L 610.0,237.0 L 676.0,216.0 L 714.0,207.0 L 733.0,207.0 L 715.0,219.0 L 751.0,207.0 L 760.0,207.0 L 768.0,214.0 L 766.0,222.0 L 756.0,231.0 L 739.0,238.0 L 720.0,242.0 L 744.0,242.0 L 745.0,243.0 L 739.0,248.0 L 708.0,260.0 L 656.0,275.0 L 624.0,292.0 L 598.0,313.0 L 550.0,360.0 L 517.0,384.0 L 481.0,400.0 L 420.0,417.0 L 389.0,433.0 L 358.0,460.0 L 340.0,484.0 L 324.0,515.0 L 318.0,533.0 L 317.0,542.0 L 333.0,512.0 L 351.0,486.0 L 376.0,460.0 L 392.0,447.0 L 408.0,437.0 L 433.0,426.0 L 487.0,413.0 L 524.0,397.0 L 557.0,373.0 L 600.0,330.0 L 632.0,303.0 L 668.0,284.0 L 702.0,274.0 L 731.0,263.0 L 760.0,246.0 L 775.0,249.0 L 799.0,261.0 L 827.0,284.0 L 841.0,299.0 L 864.0,319.0 L 884.0,330.0 L 894.0,333.0 L 906.0,333.0 L 913.0,330.0 L 926.0,335.0 L 945.0,335.0 L 951.0,332.0 L 954.0,328.0 L 954.0,323.0 L 947.0,308.0 L 960.0,303.0 L 965.0,298.0 Z" />
              </g>
            </g>

          </g>
        </svg>
      </div>

      {/* Brand Title underneath the animation */}
      <div className="flex items-center justify-center space-x-3 pt-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#1C2C34] dark:text-[#F4F4FC]">
          Mehfooz
        </h1>
        {showUrdu && (
          <span className="text-xl sm:text-2xl font-serif font-bold px-3 py-0.5 rounded-xl bg-[#ECF4F4] dark:bg-[#1A282E] text-[#FC7454] dark:text-[#FC7C54] border border-[#BCD4D4] dark:border-[#2A3C44] shadow-xs">
            محفوظ
          </span>
        )}
      </div>
    </div>
  );
};
