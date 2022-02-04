const LoadingSpinner = () => {
  return (
    <div className="flex justify-center m-8">
      <div
        className="border-t-transparent w-20 h-20 border-4 border-primary border-dotted rounded-full animate-spin"
      />
    </div>
  )
}

export default LoadingSpinner;
