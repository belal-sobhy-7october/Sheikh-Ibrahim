interface IslamicPatternProps {
  opacity?: number;
  size?: number;
}

export default function IslamicPattern({ opacity = 0.03, size = 80 }: IslamicPatternProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'%3E%3Cg fill='%23C9A84C' fill-opacity='${opacity}'%3E%3Cpath d='M${size/2} 0L${size*0.625} ${size*0.1875}L${size*0.8125} ${size*0.0625}L${size*0.75} ${size*0.25}L${size} ${size*0.25}L${size*0.8125} ${size*0.375}L${size*0.9375} ${size*0.5625}L${size*0.75} ${size*0.5}L${size*0.75} ${size*0.75}L${size*0.5625} ${size*0.625}L${size/2} ${size*0.8125}L${size*0.4375} ${size*0.625}L${size*0.25} ${size*0.75}L${size*0.25} ${size*0.5}L${size*0.0625} ${size*0.5625}L${size*0.1875} ${size*0.375}L${size*0} ${size*0.25}L${size*0.25} ${size*0.25}L${size*0.1875} ${size*0.0625}L${size*0.375} ${size*0.1875}Z'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: `${size}px ${size}px`,
        pointerEvents: "none",
      }}
    />
  );
}
