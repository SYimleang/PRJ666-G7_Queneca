import { Card, CardContent } from "@/components/ui/card";

type Props = {
  discount: number;
  code: string;
  timestamp: string;
};

export const GameRewardCard = ({ discount, code, timestamp }: Props) => {
  return (
    <Card className="border-2 border-dashed border-green-500 p-4 bg-green-50 text-center">
      <CardContent className="space-y-2">
        <div className="text-lg font-bold text-green-700">
          🎉 Congrats! You’ve Earned a Reward
        </div>
        <div className="text-2xl font-extrabold text-green-900">
          {discount}% OFF
        </div>
        <div className="text-sm text-green-700">
          Screenshot and show this to your waiter after your meal
        </div>
        <div className="text-sm font-mono text-gray-600">Code: {code}</div>
        <div className="text-xs text-gray-500">Generated on: {timestamp}</div>
        <div className="text-xs italic text-gray-400">*Valid today only</div>
      </CardContent>
    </Card>
  );
};
