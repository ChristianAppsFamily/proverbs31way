import RoomLayout from "@/components/layout/RoomLayout";

export default function TablePage() {
  return (
    <RoomLayout roomName="THE TABLE" roomSlug="table">
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="font-serif italic text-[28px] md:text-[36px] text-way-text leading-[1.4] mb-4">
          &ldquo;The Table is coming soon.&rdquo;
        </p>
        <p className="font-sans text-sm text-way-gray max-w-sm">
          A place to gather, share meals, and nourish one another in faith.
          Pull up a chair.
        </p>
      </div>
    </RoomLayout>
  );
}
